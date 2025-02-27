import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { NextRequest, NextResponse } from "next/server";

// Function to group results by key (e.g., Categories, skill levels)
const groupBy = (items: any[], key: string) => {
	return items.reduce((result, item) => {
		const value = item[key];
		if (!result[value]) {
			result[value] = { name: value, totalCount: 0 };
		}
		result[value].totalCount += 1;
		return result;
	}, {});
};

interface Extras {
	languages?: string[];
	links?: string[];
	filePaths?: string[];
}

export async function GET(req: NextRequest) {
	try {
		const filtersQuery = await db
			.select({
				id: Courses.id,
				Categories: Courses.Categories,
				tags: sql`string_to_array(${Courses.tag}, ',')`.as("tags"),
				skill_level: Courses.skill_level,
				extras: Courses.extras,
			})
			.from(Courses);

		const categoriesMap: {
			[key: string]: { name: string; totalCount: number };
		} = {};
		const tagsMap: { [key: string]: { name: string; totalCount: number } } =
			{};
		const skillLevelsMap: {
			[key: string]: { name: string; totalCount: number };
		} = {};
		const languagesMap: {
			[key: string]: { name: string; totalCount: number };
		} = {};

		filtersQuery.forEach((course) => {
			// Process Categories
			let Categories: string[] = [];
			if (course.Categories) {
				if (typeof course.Categories === "string") {
					try {
						Categories = JSON.parse(course.Categories);
					} catch (e) {
						console.error("Error parsing Categories JSON:", e);
						Categories = [];
					}
				} else if (Array.isArray(course.Categories)) {
					Categories = course.Categories;
				}
			}
			Categories.forEach((category) => {
				if (!categoriesMap[category]) {
					categoriesMap[category] = { name: category, totalCount: 0 };
				}
				categoriesMap[category].totalCount += 1;
			});

			// Process tags
			let tags: string[] = [];
			if (course.tags) {
				if (Array.isArray(course.tags)) {
					tags = course.tags;
				}
			}
			tags.forEach((tag) => {
				if (!tagsMap[tag]) {
					tagsMap[tag] = { name: tag, totalCount: 0 };
				}
				tagsMap[tag].totalCount += 1;
			});

			// Process skill levels
			const skill_level = course.skill_level;
			if (skill_level) {
				if (!skillLevelsMap[skill_level]) {
					skillLevelsMap[skill_level] = {
						name: skill_level,
						totalCount: 0,
					};
				}
				skillLevelsMap[skill_level].totalCount += 1;
			}

			// Process languages
			let languages: string[] = [];
			if (course.extras) {
				let extras: Extras;
				if (typeof course.extras === "string") {
					try {
						extras = JSON.parse(course.extras) as Extras;
					} catch (e) {
						console.error("Error parsing extras JSON:", e);
						extras = {};
					}
				} else {
					extras = course.extras as Extras;
				}
				if (extras.languages && Array.isArray(extras.languages)) {
					languages = extras.languages;
				}
			}
			languages.forEach((language) => {
				if (!languagesMap[language]) {
					languagesMap[language] = { name: language, totalCount: 0 };
				}
				languagesMap[language].totalCount += 1;
			});
		});

		// Convert Maps into arrays
		const Categories = Object.values(categoriesMap);
		const tags = Object.values(tagsMap);
		const skillLevels = Object.values(skillLevelsMap);
		const languages = Object.values(languagesMap);

		// Format the filterInputs object
		const filterInputs = [
			{
				name: "Categories",
				inputs: Categories,
			},
			{
				name: "Tags",
				inputs: tags,
			},
			{
				name: "Skill Levels",
				inputs: skillLevels,
			},
			{
				name: "Languages",
				inputs: languages,
			},
		];

		return NextResponse.json(filterInputs);
	} catch (error) {
		console.error("Error fetching filters:", error);
		return NextResponse.json(
			{ error: "Failed to fetch filters" },
			{ status: 500 }
		);
	}
}

// export async function GET(req: NextRequest) {
//   try {
//     // Fetch all distinct Categories, tags, skill levels, and languages from the Courses table
//     const filtersQuery = await db
//       .select({
//         Categories: Courses.Categories,
//         // Assuming tags are stored as comma-separated strings, split them into an array
//         tags: sql`ARRAY(SELECT unnest(string_to_array(${Courses.tag}, ',')))`.as("tags"),
//         skill_level: Courses.skill_level,
//         // Cast extras to jsonb and extract languages from the 'extras' JSONB field
//         languages: sql`ARRAY(SELECT jsonb_array_elements_text(${Courses.extras}::jsonb->'languages'))`.as(
//           "languages"
//         ),
//       })
//       .from(Courses);

//     const categoriesMap = {};
//     const tagsSet = new Set();
//     const skillLevelsSet = new Set();
//     const languagesSet = new Set();

//     filtersQuery.forEach((course) => {
//       // Process Categories
//       course.Categories.forEach((category) => {
//         if (!categoriesMap[category]) {
//           categoriesMap[category] = { name: category, totalCount: 0 };
//         }
//         categoriesMap[category].totalCount += 1;
//       });

//       // Process tags
//       course.tags.forEach((tag) => tagsSet.add(tag));

//       // Process skill levels
//       skillLevelsSet.add(course.skill_level);

//       // Process languages
//       course.languages.forEach((language) => languagesSet.add(language));
//     });

//     // Convert Sets and Map into arrays
//     const Categories = Object.values(categoriesMap);
//     const tags = Array.from(tagsSet);
//     const skillLevels = Array.from(skillLevelsSet);
//     const languages = Array.from(languagesSet);

//     // Format the filterInputs object
//     const filterInputs = [
//       {
//         name: "Categories",
//         inputs: Categories,
//       },
//       {
//         name: "Tag",
//         inputs: tags,
//       },
//       {
//         name: "Skill Level",
//         inputs: skillLevels,
//       },
//       {
//         name: "Languages",
//         inputs: languages,
//       },
//     ];

//     return NextResponse.json(filterInputs);
//   } catch (error) {
//     console.error("Error fetching filters:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch filters" },
//       { status: 500 }
//     );
//   }
// }

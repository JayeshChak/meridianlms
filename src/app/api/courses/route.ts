import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index"; // Adjust the path to your database connection
import { Courses } from "@/db/schemas/Courses"; // Adjust path as necessary
import { User } from "@/db/schemas/User";
import { and, desc, eq, inArray, like, SQL, sql } from "drizzle-orm";
import { files } from "@/db/schemas/files";
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";

// Utility function to check if the User has the required role
function hasRole(role: string) {
	return role === "teacher" || "instructor" || role === "admin";
}

// Function to ensure slug uniqueness
async function generateUniqueSlug(slug, count = 0) {
	const newSlug = count > 0 ? `${slug}-${count}` : slug;

	const existingCourse = await db
		.select()
		.from(Courses)
		.where(eq(Courses.slug, newSlug))
		.limit(1)
		.then((res) => res[0]);

	if (existingCourse) {
		return await generateUniqueSlug(slug, count + 1);
	}

	return newSlug;
}

// Create a new course
export async function POST(req: NextRequest) {
	try {
		// Parse the request body
		const body = await req.json();
		const {
			title,
			slug,
			lesson,
			duration,
			price,
			estimated_price,
			is_free,
			tag,
			skill_level,
			Categories,
			instructor_name,
			thumbnail, // URL to the image hosted on Cloudinary
			user_id,
			demo_video_url,
			description,
		} = body;

		// Fetch the User from the database using the provided user_id
		const foundUser = await db
			.select()
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1)
			.then((res) => res[0]);

		// console.log("foundUser from post req", foundUser);

		// Check if the User exists and has the required role
		if (
			!foundUser ||
			!(
				foundUser.roles.includes("admin") ||
				foundUser.roles.includes("instructor")
			)
		) {
			return NextResponse.json(
				{
					message:
						"Unauthorized: Only teachers or admins can create Courses.",
				},
				{ status: 403 }
			);
		}

		// Ensure price and estimated_price are numbers
		const parsedPrice = Number(parseFloat(price));
		const parsedEstimatedPrice = Number(parseFloat(estimated_price));

		// console.log("type of parsedPrice", typeof parsedPrice);
		// console.log("type of parsedEstimatedPrice", typeof parsedEstimatedPrice);
		// console.log("parsedPrice + parsedEstimatedPrice", parsedPrice + parsedEstimatedPrice);

		// Validate that price does not exceed estimated_price
		if (parsedPrice > parsedEstimatedPrice) {
			return NextResponse.json(
				{
					message:
						"Invalid pricing: Price cannot exceed Estimated Price.",
				},
				{ status: 400 }
			);
		}

		// Calculate discount
		const discount =
			((parsedEstimatedPrice - parsedPrice) / parsedEstimatedPrice) * 100;

		// Ensure the slug is unique
		const uniqueSlug = await generateUniqueSlug(slug);

		// Insert the new course into the database and return the inserted course
		const [newCourse] = await db
			.insert(Courses)
			.values({
				title,
				description,
				price: parsedPrice, // Convert to float
				slug: uniqueSlug,
				lesson: lesson || "", // Handle missing optional fields
				duration: duration || "", // Handle missing optional fields
				estimated_price: parsedEstimatedPrice, // Convert to float
				is_free: is_free || false,
				tag: tag || "",
				skill_level: skill_level || "",
				Categories: Array.isArray(Categories)
					? Categories
					: Categories
					? [Categories]
					: [],
				instructor_name,
				thumbnail,
				user_id,
				demo_video_url,
				discount: Number(discount.toFixed(2)), // Store discount percentage as number
			})
			.returning(); // Returning the created course

		// console.log("New course created:", newCourse);

		// Update files with the above-created course ID
		if (demo_video_url) {
			await db
				.update(files)
				.set({ course_id: newCourse.id }) // Use the new course ID
				.where(eq(files.path, demo_video_url)); // Update files only where the path matches demo_video_url

			// console.log("🚀 ~ POST ~ files updated with course_id");
		}

		return NextResponse.json(
			{ message: "Course created successfully", course: newCourse },
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Error creating course.", error: error.message },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const searchParams = url.searchParams;

		const search = searchParams.get("search") || "";
		const categoryFilter = searchParams.get("category") || "";
		const tag = searchParams.get("tag") || "";
		const skill_level = searchParams.get("skill_level") || "";
		const languageFilter = searchParams.get("language") || "";
		const slug = searchParams.get("slug") || "";

		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "12", 10);
		const offset = (page - 1) * limit;

		const is_published = true; // Always fetch only published Courses
		const whereConditions: any[] = [eq(Courses.is_published, is_published)];

		// Handle search
		if (search) {
			whereConditions.push(like(Courses.title, `%${search}%`));
		}

		// Handle category
		if (categoryFilter) {
			whereConditions.push(
				sql`EXISTS (
          SELECT 1 FROM json_array_elements_text(${Courses.Categories}) AS elem
          WHERE elem = ${sql.param(categoryFilter)}
        )`
			);
		}

		// Handle tag
		if (tag) {
			whereConditions.push(
				sql`${sql.param(tag)} = ANY(string_to_array(${
					Courses.tag
				}, ','))`
			);
		}

		// Handle skill level
		if (skill_level) {
			whereConditions.push(eq(Courses.skill_level, skill_level));
		}

		// Handle language
		if (languageFilter) {
			whereConditions.push(
				sql`EXISTS (
          SELECT 1 FROM json_array_elements_text((${
				Courses.extras
			}::json -> 'languages')) AS elem
          WHERE elem = ${sql.param(languageFilter)}
        )`
			);
		}

		// Handle slug
		if (slug) {
			whereConditions.push(eq(Courses.slug, slug));
		}

		// Fetch filtered Courses based on conditions
		const allCourses = await db
			.select()
			.from(Courses)
			.where(and(...whereConditions))
			.limit(limit)
			.offset(offset)
			.orderBy(desc(Courses.created_at));

		const courseIds = allCourses.map((course) => course.id);

		// Fetch related Chapters and Lectures
		const allChapters = await db
			.select()
			.from(Chapters)
			.where(inArray(Chapters.course_id, courseIds));

		const chapterIds = allChapters.map((chapter) => chapter.id);

		const allLectures = await db
			.select()
			.from(Lectures)
			.where(inArray(Lectures.chapter_id, chapterIds));

		// Map over Chapters and Courses to construct coursesWithChapters
		const chaptersWithLectures = allChapters.map((chapter) => {
			const chapterLectures = allLectures.filter(
				(lecture) => lecture.chapter_id === chapter.id
			);

			const chapterDuration = chapterLectures.reduce((total, lecture) => {
				return total + (parseInt(lecture.duration, 10) || 0);
			}, 0);

			return {
				...chapter,
				Lectures: chapterLectures,
				totalLectures: chapterLectures.length,
				duration: `${chapterDuration} minutes`,
			};
		});

		const coursesWithChapters = allCourses.map((course) => {
			const Chapters = chaptersWithLectures.filter(
				(chapter) => chapter.course_id === course.id
			);

			const courseDuration = Chapters.reduce((total, chapter) => {
				return total + (parseInt(chapter.duration, 10) || 0);
			}, 0);

			const totalCourseLectures = Chapters.reduce((total, chapter) => {
				return total + chapter.totalLectures;
			}, 0);

			return {
				...course,
				Chapters: Chapters,
				duration: `${courseDuration} minutes`,
				lesson: totalCourseLectures,
			};
		});

		// Calculate total number of matching Courses
		const totalCoursesResult = await db.execute(
			sql`SELECT COUNT(*)::int FROM ${Courses} WHERE ${and(
				...whereConditions
			)}`
		);

		const totalCourses = totalCoursesResult.rows[0]?.count || 0;

		const hasNext = offset + limit < totalCourses;
		const hasPrevious = offset > 0;

		return NextResponse.json({
			message: "Courses fetched successfully",
			length: allCourses.length,
			total: totalCourses,
			page,
			perPage: limit,
			hasNext,
			hasPrevious,
			data: coursesWithChapters,
		});
	} catch (error) {
		console.error("Error fetching Courses:", error);
		return NextResponse.json(
			{
				message: "Error fetching Courses.",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

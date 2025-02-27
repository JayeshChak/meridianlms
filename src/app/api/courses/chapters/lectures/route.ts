import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Lectures } from "@/db/schemas/Lectures";
import { Chapters } from "@/db/schemas/Chapters";
import { Courses } from "@/db/schemas/Courses";
import { eq, sql } from "drizzle-orm";

// Utility function to convert minutes to hours in format `x.xx hours`
const convertMinutesToHours = (totalMinutes: number) => {
	const hours = (totalMinutes / 60).toFixed(2);
	return `${hours} hours`;
};

// Utility function to safely cast strings like "30 minutes" to integers
const extractMinutes = (duration: string) => {
	const match = duration.match(/^(\d+)\s*minutes$/);
	return match ? parseInt(match[1], 10) : 0;
};

// Update chapter duration based on all lecture durations
// Utility function to sum durations in minutes
const updateChapterDuration = async (chapter_id: string) => {
	// Sum all lecture durations for the chapter in minutes
	const totalDurationInMinutes = await db
		.select({ totalDuration: sql`SUM(CAST(Lectures.duration AS int))` })
		.from(Lectures)
		.where(eq(Lectures.chapter_id, chapter_id))
		.then((res) => res[0]?.totalDuration || 0);

	// Update the chapter with the total duration in minutes
	const updatedChapterDeration = await db
		.update(Chapters)
		.set({ duration: `${totalDurationInMinutes} minutes` })
		.where(eq(Chapters.id, chapter_id))
		.returning();
};

// Update course duration based on all chapter durations
const updateCourseDuration = async (course_id: string) => {
	// Sum all chapter durations for the course
	const totalDurationInMinutes = await db
		.select({
			totalDuration: sql`SUM(CAST(SPLIT_PART(Chapters.duration, ' ', 1) AS int))`,
		})
		.from(Chapters)
		.where(eq(Chapters.course_id, course_id))
		.then((res) => res[0]?.totalDuration || 0);

	const newCourseDuration = convertMinutesToHours(totalDurationInMinutes);

	// Update the course with the new total duration
	const updatedCourse = await db
		.update(Courses)
		.set({ duration: newCourseDuration })
		.where(eq(Courses.id, course_id))
		.returning();
	// console.log("updatedChapterDeration -> updatedCourse",updatedCourse)
};

// Create or update a lecture
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			chapter_id,
			title,
			description,
			duration,
			video_url,
			is_preview,
			course_id,
		} = body;

		// Validate required fields
		if (!chapter_id || !title || !duration || !video_url) {
			return NextResponse.json(
				{
					message:
						"chapter_id, title, duration, and video_url are required fields.",
				},
				{ status: 400 }
			);
		}

		// Ensure the chapter exists
		const foundChapter = await db
			.select()
			.from(Chapters)
			.where(eq(Chapters.id, chapter_id))
			.limit(1)
			.then((res) => res[0]);

		if (!foundChapter) {
			return NextResponse.json(
				{ message: "Chapter not found." },
				{ status: 404 }
			);
		}

		// Get the current max order of the Lectures in the chapter
		const maxOrderResult = await db
			.select({ maxOrder: sql`MAX("order"::int)` })
			.from(Lectures)
			.where(eq(Lectures.chapter_id, chapter_id))
			.then((res) => res[0]?.maxOrder || 0);

		const nextOrder = (maxOrderResult + 1).toString(); // Increment the order by 1

		// Insert the new lecture into the database with the correct order
		const newLecture = await db
			.insert(Lectures)
			.values({
				chapter_id,
				title,
				description: description || "",
				duration, // Ensure this is passed as a number (minutes) from the frontend
				video_url,
				is_preview: is_preview || false,
				is_locked: !is_preview,
				order: nextOrder,
			})
			.returning();

		// After inserting the lecture, update the chapter duration
		await updateChapterDuration(chapter_id);

		// After updating the chapter duration, update the course duration
		await updateCourseDuration(course_id);

		return NextResponse.json(
			{ message: "Lecture created successfully", lecture: newLecture },
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Error creating lecture.", error: error.message },
			{ status: 500 }
		);
	}
}

// Helper function to convert duration strings to minutes
function parseDuration(duration: string): number {
	if (!duration) return 0; // Return 0 if duration is undefined or null

	const parts = duration.split(" ");
	const amount = parseInt(parts[0], 10);

	if (isNaN(amount)) return 0; // Return 0 if the amount is not a number

	const unit = parts[1] ? parts[1].toLowerCase() : "minutes"; // Default to minutes if unit is missing

	if (unit.includes("minute")) {
		return amount;
	} else if (unit.includes("hour")) {
		return amount * 60;
	}

	return 0;
}

export async function GET(req: NextRequest) {
	try {
		// Extract the query parameters
		const { searchParams } = new URL(req.url);
		const chapter_id = searchParams.get("chapter_id");

		// Validate the chapter_id parameter
		if (!chapter_id) {
			return NextResponse.json(
				{ message: "chapter_id is required." },
				{ status: 400 }
			);
		}

		// Fetch Lectures by chapter_id
		const chapterLectures = await db
			.select()
			.from(Lectures)
			.where(eq(Lectures.chapter_id, chapter_id));

		// If no Lectures found for the chapter
		if (chapterLectures.length === 0) {
			return NextResponse.json(
				{ message: "No Lectures found for this chapter." },
				{ status: 404 }
			);
		}

		// Calculate total duration
		const totalDurationInMinutes = chapterLectures.reduce(
			(total, lecture) => {
				return total + parseDuration(lecture.duration);
			},
			0
		);

		// Format total duration as "X hours Y minutes"
		const hours = Math.floor(totalDurationInMinutes / 60);
		const minutes = totalDurationInMinutes % 60;
		const formattedDuration = `${
			hours > 0 ? `${hours} hours ` : ""
		}${minutes} minutes`;

		// Return the Lectures with total duration
		return NextResponse.json(
			{
				message: "Lectures fetched successfully",
				totalDuration: formattedDuration,
				data: chapterLectures,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching Lectures:", error);
		return NextResponse.json(
			{ message: "Error fetching Lectures.", error: error.message },
			{ status: 500 }
		);
	}
}

// update api for edit lecture
// PUT request to update an existing lecture by ID
// export async function PUT(req: NextRequest) {
//   try {
//     // Extract the lecture ID from the URL (assuming it's passed as a query parameter)
//     const { searchParams } = new URL(req.url);
//     const lectureId = searchParams.get("id");

//     if (!lectureId) {
//       return NextResponse.json(
//         { message: "Lecture ID is required." },
//         { status: 400 }
//       );
//     }

//     // Parse the request body
//     const body = await req.json();
//     const {
//       chapter_id,
//       title,
//       description,
//       duration,
//       video_url,
//       is_preview,
//       order,
//     } = body;

//     // Validate the required fields
//     if (
//       !title &&
//       !description &&
//       !duration &&
//       !video_url &&
//       is_preview === undefined &&
//       !order
//     ) {
//       return NextResponse.json(
//         { message: "At least one field is required to update." },
//         { status: 400 }
//       );
//     }

//     // Check if the lecture exists
//     const existingLecture = await db
//       .select()
//       .from(Lectures)
//       .where(eq(Lectures.id, lectureId))
//       .limit(1)
//       .then((res) => res[0]);

//     if (!existingLecture) {
//       return NextResponse.json(
//         { message: "Lecture not found." },
//         { status: 404 }
//       );
//     }

//     // Prepare the update data
//     const updateData: Partial<typeof Lectures> = {};
//     if (chapter_id) updateData.chapter_id = chapter_id;
//     if (title) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (duration) updateData.duration = duration;
//     if (video_url) updateData.video_url = video_url;
//     if (is_preview !== undefined) updateData.is_preview = is_preview;
//     if (order) updateData.order = order;
//     updateData.is_locked = !is_preview as any; // Update lock status based on is_preview

//     // Update the lecture in the database
//     const updatedLecture = await db
//       .update(Lectures)
//       .set(updateData)
//       .where(eq(Lectures.id, lectureId))
//       .returning();

//     return NextResponse.json(
//       { message: "Lecture updated successfully", lecture: updatedLecture },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error updating lecture:", error);
//     return NextResponse.json(
//       { message: "Error updating lecture.", error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const lectureId = searchParams.get("id");

		if (!lectureId) {
			return NextResponse.json(
				{ message: "Lecture ID is required." },
				{ status: 400 }
			);
		}

		const body = await req.json();
		const {
			chapter_id,
			title,
			description,
			duration,
			video_url,
			is_preview,
			order,
		} = body;

		if (
			!title &&
			!description &&
			!duration &&
			!video_url &&
			is_preview === undefined &&
			!order
		) {
			return NextResponse.json(
				{ message: "At least one field is required to update." },
				{ status: 400 }
			);
		}

		const existingLecture = await db
			.select()
			.from(Lectures)
			.where(eq(Lectures.id, lectureId))
			.limit(1)
			.then((res) => res[0]);

		if (!existingLecture) {
			return NextResponse.json(
				{ message: "Lecture not found." },
				{ status: 404 }
			);
		}

		const updateData = {
			chapter_id,
			title,
			description,
			duration,
			video_url,
			is_preview,
			order,
			is_locked: !is_preview,
		};

		const updatedLecture = await db
			.update(Lectures)
			.set(updateData)
			.where(eq(Lectures.id, lectureId))
			.returning();

		// After updating, recalculate durations
		if (chapter_id || duration) {
			await updateChapterDuration(existingLecture.chapter_id); // Recalculate using the chapter ID of the lecture
			const chapter = await db
				.select()
				.from(Chapters)
				.where(eq(Chapters.id, existingLecture.chapter_id))
				.then((res) => res[0]);
			await updateCourseDuration(chapter.course_id);
		}

		return NextResponse.json(
			{
				message: "Lecture updated successfully",
				lecture: updatedLecture,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating lecture:", error);
		return NextResponse.json(
			{ message: "Error updating lecture.", error: error.message },
			{ status: 500 }
		);
	}
}

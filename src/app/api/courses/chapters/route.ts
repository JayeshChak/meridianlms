import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Chapters } from "@/db/schemas/Chapters";
import { Courses } from "@/db/schemas/Courses";
import { sql, eq } from "drizzle-orm";
import { Lectures } from "@/db/schemas/Lectures";

// Utility function to convert a duration string (e.g., "0 minutes") into total minutes
function convertDurationToMinutes(duration: string) {
	const minutesMatch = duration.match(/(\d+)\s*minute/);
	const hoursMatch = duration.match(/(\d+)\s*hour/);

	let totalMinutes = 0;

	if (hoursMatch) {
		totalMinutes += parseInt(hoursMatch[1], 10) * 60; // Convert hours to minutes
	}

	if (minutesMatch) {
		totalMinutes += parseInt(minutesMatch[1], 10); // Add minutes
	}

	return totalMinutes;
}

// Create a new chapter
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { course_id, title, description, order, duration } = body;

		// Ensure course_id, title, and duration are provided
		if (!course_id || !title || !duration) {
			return NextResponse.json(
				{
					message:
						"course_id, title, and duration are required fields.",
				},
				{ status: 400 }
			);
		}

		// Convert the duration string into total minutes
		const durationInMinutes = convertDurationToMinutes(duration);

		// Insert the new chapter into the database with the converted duration
		const newChapter = await db
			.insert(Chapters)
			.values({
				course_id,
				title,
				description: description || "",
				order: order || "1",
				duration: durationInMinutes, // Store duration as an integer in minutes
			})
			.returning();

		return NextResponse.json(
			{ message: "Chapter created successfully", chapter: newChapter },
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Error creating chapter.", error: error.message },
			{ status: 500 }
		);
	}
}

// Delete a chapter by ID
export async function DELETE(req: NextRequest) {
	try {
		// Parse the request URL to get the chapter ID
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		// Validate the id parameter
		if (!id) {
			return NextResponse.json(
				{ message: "id is required." },
				{ status: 400 }
			);
		}

		// Delete the chapter from the database
		const deletedChapter = await db
			.delete(Chapters)
			.where(eq(Chapters.id, id))
			.returning();

		// Check if the deletion was successful
		if (deletedChapter.length === 0) {
			return NextResponse.json(
				{ message: "Chapter not found." },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				message: "Chapter deleted successfully",
				chapter: deletedChapter,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting chapter:", error);
		return NextResponse.json(
			{ message: "Error deleting chapter.", error: error.message },
			{ status: 500 }
		);
	}
}

// Helper function to convert duration strings to minutes
function parseDuration(duration: string): number {
	const [amount, unit] = duration.split(" ");
	const parsedAmount = parseInt(amount, 10);

	if (isNaN(parsedAmount)) return 0;

	if (unit.includes("minute")) {
		return parsedAmount;
	} else if (unit.includes("hour")) {
		return parsedAmount * 60;
	}

	return 0;
}

// Get all Chapters by course ID with filtering and pagination
export async function GET(req: NextRequest) {
	try {
		// Extract the query parameters
		const { searchParams } = new URL(req.url);
		const course_id = searchParams.get("course_id");

		// Validate the course_id parameter
		if (!course_id) {
			return NextResponse.json(
				{ message: "course_id is required." },
				{ status: 400 }
			);
		}

		// Fetch Chapters by course_id without additional filters
		const Chapters = await db
			.select()
			.from(Chapters)
			.where(eq(Chapters.course_id, course_id));

		// If no Chapters found for the course
		if (!Chapters || Chapters.length === 0) {
			return NextResponse.json(
				{ message: "No Chapters found for this course." },
				{ status: 404 }
			);
		}

		// Calculate total duration and number of Chapters
		let totalDuration = 0;
		for (const chapter of Chapters) {
			totalDuration += parseDuration(chapter.duration);
		}

		const totalChapters = Chapters.length;

		// Return the Chapters with total duration and number of Chapters
		return NextResponse.json(
			{
				message: "Chapters fetched successfully",
				totalDuration: `${Math.floor(totalDuration / 60)} hours ${
					totalDuration % 60
				} minutes`,
				totalChapters,
				data: Chapters,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching Chapters:", error);
		return NextResponse.json(
			{ message: "Error fetching Chapters.", error: error.message },
			{ status: 500 }
		);
	}
}

// Helper function to format minutes into hours and minutes
function formatDuration(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${hours} hours ${minutes} minutes`;
}

// Update a chapter's duration by summing up the durations of all Lectures
export async function PUT(req: NextRequest) {
	try {
		// Parse the request body
		const body = await req.json();
		const { chapter_id } = body;

		// Validate the required fields
		if (!chapter_id) {
			return NextResponse.json(
				{ message: "chapter_id is required." },
				{ status: 400 }
			);
		}

		// Fetch all Lectures associated with the chapter
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

		// Calculate the total duration of all Lectures
		let totalDuration = 0;
		chapterLectures.forEach((lecture) => {
			totalDuration += parseDuration(lecture.duration);
		});

		// Format the total duration
		const formattedDuration = formatDuration(totalDuration);

		// Update the chapter's duration
		const updatedChapter = await db
			.update(Chapters)
			.set({ duration: formattedDuration })
			.where(eq(Chapters.id, chapter_id))
			.returning();

		// Check if the update was successful
		if (updatedChapter.length === 0) {
			return NextResponse.json(
				{ message: "Chapter not found or no changes made." },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				message: "Chapter duration updated successfully",
				chapter: updatedChapter,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating chapter:", error);
		return NextResponse.json(
			{ message: "Error updating chapter.", error: error.message },
			{ status: 500 }
		);
	}
}

// // Update a chapter by ID
//   export async function PUT(req: NextRequest) {
//     try {
//       // Parse the request body
//       const body = await req.json();
//       const { id, title, description, order, duration } = body;

//       // Validate the required fields
//       if (!id || !title || !duration) {
//         return NextResponse.json(
//           { message: "id, title, and duration are required fields." },
//           { status: 400 }
//         );
//       }

//       // Update the chapter in the database
//       const updatedChapter = await db
//         .update(Chapters)
//         .set({
//           title,
//           description,
//           order,
//           duration,
//         })
//         .where(eq(Chapters.id, id))
//         .returning();

//       // Check if the update was successful
//       if (updatedChapter.length === 0) {
//         return NextResponse.json(
//           { message: "Chapter not found or no changes made." },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json(
//         { message: "Chapter updated successfully", chapter: updatedChapter },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Error updating chapter:", error);
//       return NextResponse.json(
//         { message: "Error updating chapter.", error: error.message },
//         { status: 500 }
//       );
//     }
//   }

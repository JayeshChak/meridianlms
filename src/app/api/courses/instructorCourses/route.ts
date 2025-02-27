import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db"; // Assuming you have your Drizzle ORM connection here
import { Courses } from "@/db/schemas/Courses"; // Your Courses schema
import { eq } from "drizzle-orm"; // For where conditions

// Force dynamic behavior to prevent static generation attempts
export const dynamic = "force-dynamic";

// GET handler to fetch all Courses for a specific instructor (both published and draft)
export async function GET(req: NextRequest) {
	try {
		// Extract instructor ID (user_id) from the query parameters
		const url = new URL(req.url);
		const searchParams = url.searchParams;
		const instructorId = searchParams.get("instructorId");

		// Check if instructorId is provided
		if (!instructorId) {
			return NextResponse.json(
				{ error: "Missing instructorId in query parameters." },
				{ status: 400 }
			);
		}

		// Query the database to fetch all Courses by this instructor (both draft and published)
		const instructorCourses = await db
			.select()
			.from(Courses)
			.where(eq(Courses.user_id, instructorId));

		// Check if any Courses were found
		if (instructorCourses.length === 0) {
			return NextResponse.json(
				{ message: "No Courses found for this instructor." },
				{ status: 404 }
			);
		}

		// Return the Courses (published and draft)
		return NextResponse.json(
			{
				message: "Courses fetched successfully",
				Courses: instructorCourses,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching instructor Courses:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch instructor Courses.",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

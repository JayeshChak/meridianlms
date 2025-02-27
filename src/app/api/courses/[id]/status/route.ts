import { eq } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { db } from "@/db/index";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		// Validate the UUID
		if (!uuidValidate(id)) {
			return NextResponse.json(
				{ message: "Invalid UUID format." },
				{ status: 400 }
			);
		}

		// Fetch the course by ID and select only the is_published field
		const courseResult = await db
			.select({
				is_published: Courses.is_published,
			})
			.from(Courses)
			.where(eq(Courses.id, id))
			.limit(1);

		const course = courseResult[0];

		// Check if the course was found
		if (!course) {
			return NextResponse.json(
				{ message: "Course not found." },
				{ status: 404 }
			);
		}

		// Return the is_published status
		return NextResponse.json({
			is_published: course.is_published,
		});
	} catch (error) {
		// Handle all other errors
		console.error("Error fetching course status:", error);

		return NextResponse.json(
			{ message: "An unexpected error occurred.", error: error.message },
			{ status: 500 }
		);
	}
}

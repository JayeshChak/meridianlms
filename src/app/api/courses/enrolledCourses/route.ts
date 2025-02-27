import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Assuming db is your Drizzle ORM instance
import { Courses } from "@/db/schemas/Courses"; // Import Courses schema
import { inArray } from "drizzle-orm"; // For handling array-based queries

export async function POST(req: NextRequest) {
	try {
		// Parse the JSON body from the request
		const { enrolled_courses } = await req.json();

		// Validate if the body contains valid data
		if (!Array.isArray(enrolled_courses) || enrolled_courses.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid or empty enrolled_courses array provided",
				},
				{ status: 400 }
			);
		}

		// Extract unique course IDs from the enrolled_courses array
		const courseIds = Array.from(
			new Set(enrolled_courses.map((course) => course.course_id))
		); // Convert Set to array

		// Fetch the course details for the provided course IDs
		const fetchedCourses = await db
			.select({
				id: Courses.id,
				title: Courses.title,
				lesson: Courses.lesson,
				duration: Courses.duration,
				thumbnail: Courses.thumbnail,
				price: Courses.price,
				estimated_price: Courses.estimated_price,
				is_free: Courses.is_free,
				Categories: Courses.Categories,
				instructor_name: Courses.instructor_name,
				enrolled_count: Courses.enrolled_count,
			})
			.from(Courses)
			.where(inArray(Courses.id, courseIds));

		// If no Courses are found, return a 404 response
		if (!fetchedCourses || fetchedCourses.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "No Courses found for the provided course IDs",
				},
				{ status: 404 }
			);
		}

		// Combine fetched course details with progress data from enrolled_courses
		const enrichedCourses = fetchedCourses.map((course) => {
			const courseProgress = enrolled_courses.find(
				(enroll) => enroll.course_id === course.id
			);
			return {
				...course,
				progress: courseProgress ? courseProgress.progress : 0,
			};
		});

		// Return the enriched course data
		return NextResponse.json({
			success: true,
			data: enrichedCourses,
		});
	} catch (error) {
		console.error("Error fetching enrolled Courses with progress:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching enrolled Courses with progress",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

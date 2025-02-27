import { db } from "@/db";
import { desc, eq, ilike, sql } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { NextRequest, NextResponse } from "next/server";
import { htmlToText } from "html-to-text"; // Import the html-to-text package

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 10; // Number of Courses per page
	const offset = (page - 1) * limit;

	// Get query parameters for Categories and search
	const category = url.searchParams.get("category"); // Category filter
	const searchQuery = url.searchParams.get("q"); // Search query filter

	try {
		// Build base query for fetching Courses with optional filters
		let courseQuery = db
			.select({
				id: Courses.id,
				title: Courses.title,
				image: Courses.thumbnail, // Assuming this is the image field
				instructor: Courses.instructor_name, // Instructor's name
				Categories: Courses.Categories, // Categories
				description: Courses.description, // Get the description to extract tags from it
			})
			.from(Courses)
			.where(eq(Courses.is_published, true)) // Only fetch published Courses
			.groupBy(Courses.id)
			.orderBy(desc(Courses.created_at)) // Get most recent Courses first
			.limit(limit)
			.offset(offset);

		// Apply category filter if provided
		if (category) {
			courseQuery = courseQuery.where(
				sql`${Courses.Categories} @> ${JSON.stringify([
					category,
				])}::jsonb`
			);
		}

		// Apply search query filter if provided
		if (searchQuery) {
			courseQuery = courseQuery.where(
				ilike(Courses.description, `%${searchQuery}%`)
			);
		}

		const result = await courseQuery;

		// Clean HTML from descriptions and extract keywords
		const cleanedResults = result.map((course) => {
			const plainTextDescription = htmlToText(course.description, {
				wordwrap: false,
				ignoreHref: true,
				ignoreImage: true,
			});

			// Extract the first few meaningful words as tags
			const tags = plainTextDescription
				.split(/\s+/) // Split by spaces
				.filter((word) => word.length > 3) // Filter out short words
				.slice(0, 5); // Take the first 5 words for the tags

			return {
				id: course.id,
				title: course.title,
				image: course.image,
				instructor: course.instructor,
				Categories: course.Categories,
				tags, // Return the cleaned tags
			};
		});

		// Build the query for counting total Courses with the same filters
		let totalCoursesQuery = db
			.select({ count: sql`COUNT(*)`.as("total") })
			.from(Courses)
			.where(eq(Courses.is_published, true));

		if (category) {
			totalCoursesQuery = totalCoursesQuery.where(
				sql`${Courses.Categories} @> ${JSON.stringify([
					category,
				])}::jsonb`
			);
		}

		if (searchQuery) {
			totalCoursesQuery = totalCoursesQuery.where(
				ilike(Courses.description, `%${searchQuery}%`)
			);
		}

		const totalCourses = await totalCoursesQuery;

		return NextResponse.json({
			Courses: cleanedResults,
			totalCourses: totalCourses[0].total,
			currentPage: page,
			totalPages: Math.ceil(totalCourses[0].total / limit),
		});
	} catch (error) {
		console.error("Error fetching recent Courses:", error);
		return NextResponse.json(
			{ error: "Failed to fetch recent Courses" },
			{ status: 500 }
		);
	}
}

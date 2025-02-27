import { db } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 10; // Number of Courses per page
	const offset = (page - 1) * limit;

	try {
		const result = await db
			.select({
				course_id: Courses.id,
				title: Courses.title,
				slug: Courses.slug,
				lesson: sql`COUNT(DISTINCT ${Lectures.id}) AS lesson_count`, // Total number of Lectures (lessons)
				// lesson: Courses.lesson,
				featured: Courses.featured,
				// price: Courses.price,
				// estimated_price: Courses.estimated_price,
				is_free: Courses.is_free,
				tag: Courses.tag,
				skill_level: Courses.skill_level,
				Categories: Courses.Categories,
				instructor_name: Courses.instructor_name,
				thumbnail: Courses.thumbnail,
				created_at: Courses.created_at,
				enrolled_count: Courses.enrolled_count,
				// discount: Courses.discount,
				// reviews: Courses.reviews,
				// comments: Courses.comments,
				// Calculate the total duration of all Chapters and Lectures
				totalDuration:
					sql`COALESCE(SUM(TO_NUMBER(NULLIF(${Chapters.duration}, '')::TEXT, '9999')), 0) 
                           + COALESCE(SUM(TO_NUMBER(NULLIF(${Lectures.duration}, '')::TEXT, '9999')), 0)`.as(
						"total_duration"
					),
			})
			.from(Courses)
			.leftJoin(Chapters, sql`${Chapters.course_id} = ${Courses.id}`)
			.leftJoin(Lectures, sql`${Lectures.chapter_id} = ${Chapters.id}`)
			.where(eq(Courses.is_published, true)) // Only fetch published Courses
			.groupBy(Courses.id)
			.orderBy(desc(Courses.created_at)) // Get most recent Courses first Courses.created_at.desc()
			.limit(limit)
			.offset(offset);

		// Get total course count for pagination
		const totalCourses = await db
			.select({ count: sql`COUNT(*)`.as("total") })
			.from(Courses)
			.where(eq(Courses.is_published, true)); // Courses.is_published.eq(true)

		return NextResponse.json({
			Courses: result,
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

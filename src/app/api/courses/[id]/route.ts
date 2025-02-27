import { eq, inArray, sql } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";
import { db } from "@/db/index";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { issueCertificate } from "@/utils/certificateIssuer";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params; // Course ID
		const body = await req.json(); // Get the JSON body from the request

		console.log("body.extras", body);

		// Update the course
		await db
			.update(Courses)
			.set({
				title: body.title,
				slug: body.slug,
				lesson: body.lesson,
				duration: body.duration,
				featured: body.featured,
				price: body.price,
				estimated_price: body.estimated_price,
				is_free: body.is_free,
				tag: body.tag,
				skill_level: body.skill_level,
				Categories: body.Categories,
				instructor_name: body.instructor_name,
				thumbnail: body.thumbnail,
				demo_video_url: body.demo_video_url,
				is_published: body.is_published,
				updated_at: new Date(), // Update the updated_at timestamp
			})
			.where(eq(Courses.id, id));

		// Fetch the updated course data
		const updatedCourse = await db
			.select()
			.from(Courses)
			.where(eq(Courses.id, id));

		return NextResponse.json({
			message: "Course updated successfully",
			data: updatedCourse[0], // Return the first item in the array
		});
	} catch (error) {
		console.error("Error during course update:", error);
		return NextResponse.json(
			{ message: "Error updating course details.", error: error.message },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params; // Course ID

		// Optional: If you want to delete related Chapters and Lectures
		await db.delete(Lectures).where(eq(Lectures.chapter_id, id));
		await db.delete(Chapters).where(eq(Chapters.course_id, id));

		// Delete the course
		const deleteResult = await db.delete(Courses).where(eq(Courses.id, id));

		if (deleteResult.rowCount === 0) {
			return NextResponse.json(
				{ message: "Course not found or already deleted." },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Course deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting course:", error);
		return NextResponse.json(
			{ message: "Error deleting course.", error: error.message },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params; // Course ID
		const body = await req.json();

		console.log("Incoming PATCH request body:", body);

		// 1. Check if course exists
		const existingCourse = await db
			.select()
			.from(Courses)
			.where(eq(Courses.id, id))
			.limit(1);

		if (!existingCourse.length) {
			console.error("❌ Course not found, cannot update.");
			return NextResponse.json(
				{ message: "Course not found." },
				{ status: 404 }
			);
		}
		console.log("✅ Course found, proceeding with update.");

		// 2. Build updateFields
		const updateFields: any = {
			updated_at: new Date(),
		};

		// Assign the fields if they exist in body
		const fieldsToCheck = [
			"title",
			"slug",
			"lesson",
			"duration",
			"featured",
			"price",
			"estimated_price",
			"is_free",
			"tag",
			"skill_level",
			"Categories",
			"instructor_name",
			"thumbnail",
			"demo_video_url",
			"is_published",
			"extras",
			"certificate_id",
		];

		for (const field of fieldsToCheck) {
			if (body[field] !== undefined) {
				updateFields[field] = body[field];
			}
		}

		console.log("✅ Final updateFields object:", updateFields);

		// 3. Perform the update
		const updateResult = await db
			.update(Courses)
			.set(updateFields)
			.where(eq(Courses.id, id))
			.returning();

		console.log(
			"✅ Update executed, affected rows:",
			updateResult.affectedRows
		);

		// 4. Fetch & return updated course
		const updatedCourse = await db
			.select()
			.from(Courses)
			.where(eq(Courses.id, id))
			.limit(1);

		console.log("✅ Course after update:", updatedCourse[0]);

		return NextResponse.json({
			message: "Course updated successfully",
			data: updatedCourse[0],
		});
	} catch (error) {
		console.error("❌ Error during course update:", error);
		return NextResponse.json(
			{ message: "Error updating course details.", error: error.message },
			{ status: 500 }
		);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		// Fetch the course by ID
		const courseResult = await db
			.select()
			.from(Courses)
			.where(eq(Courses.id, id))
			.limit(1);

		const course = courseResult[0];

		if (!course) {
			return NextResponse.json(
				{ message: "Course not found" },
				{ status: 404 }
			);
		}

		// Fetch Chapters related to the course ID
		const Chapters = await db
			.select()
			.from(Chapters)
			.where(eq(Chapters.course_id, id));

		// Extract chapter IDs to fetch related Lectures
		const chapterIds = Chapters.map((chapter) => chapter.id);

		// Fetch Lectures related to the chapter IDs
		const courseLectures = await db
			.select()
			.from(Lectures)
			.where(inArray(Lectures.chapter_id, chapterIds));

		// Calculate total lessons (number of Lectures)
		const totalLessonCount = courseLectures.length;

		// Nest Lectures under their respective Chapters
		const chaptersWithLectures = Chapters.map((chapter) => {
			return {
				...chapter,
				Lectures: courseLectures.filter(
					(lecture) => lecture.chapter_id === chapter.id
				),
			};
		});

		// Nest Chapters under the course and add calculated fields
		const courseWithChapters = {
			...course,
			Chapters: chaptersWithLectures,
			lesson: totalLessonCount, // Total number of Lectures
			duration: course.duration, // Total course duration
		};

		return NextResponse.json({
			message: "Course details fetched successfully",
			data: courseWithChapters,
		});
	} catch (error) {
		return NextResponse.json(
			{ message: "Error fetching course details.", error: error.message },
			{ status: 500 }
		);
	}
}

// src/app/api/User/[user_id]/markComplete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { User } from "@/db/schemas/User";
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";
import { eq, inArray } from "drizzle-orm";

// UUID validation regex
const uuidRegex =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Helper function to retrieve all chapter IDs for a given course.
 * @param course_id - The UUID of the course.
 * @returns An array of chapter IDs.
 */
async function getChapterIds(course_id: string): Promise<string[]> {
	const Chapters = await db
		.select({
			id: Chapters.id,
		})
		.from(Chapters)
		.where(eq(Chapters.course_id, course_id));

	return Chapters.map((chapter) => chapter.id);
}

/**
 * Helper function to retrieve all lecture IDs for given chapter IDs.
 * @param chapterIds - An array of chapter IDs.
 * @returns An array of lecture IDs.
 */
async function getLectureIds(chapterIds: string[]): Promise<string[]> {
	const courseLectures = await db
		.select({
			id: Lectures.id,
		})
		.from(Lectures)
		.where(inArray(Lectures.chapter_id, chapterIds));

	return courseLectures.map((lecture) => lecture.id);
}

export async function POST(
	req: NextRequest,
	{ params }: { params: { user_id: string } }
) {
	const { user_id } = params;

	if (!user_id) {
		return NextResponse.json(
			{ error: "User ID is required." },
			{ status: 400 }
		);
	}

	try {
		const body = await req.json();
		const { course_id, lectureId, isCompleted } = body;

		// **Step 1: Validate Request Body**

		// Check if all required fields are present
		if (!course_id || !lectureId || typeof isCompleted !== "boolean") {
			return NextResponse.json(
				{
					error: "Missing required fields: 'course_id', 'lectureId', 'isCompleted'.",
				},
				{ status: 400 }
			);
		}

		// Validate UUID formats
		if (
			typeof course_id !== "string" ||
			typeof lectureId !== "string" ||
			!uuidRegex.test(course_id) ||
			!uuidRegex.test(lectureId)
		) {
			return NextResponse.json(
				{
					error: "Invalid 'course_id' or 'lectureId' format. Must be valid UUID strings.",
				},
				{ status: 400 }
			);
		}

		// **Step 2: Fetch Existing User Data**

		const existingUser = await db
			.select({
				enrolled_courses: User.enrolled_courses,
			})
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1)
			.then((rows) => rows[0]);

		if (!existingUser) {
			return NextResponse.json(
				{ error: "User not found." },
				{ status: 404 }
			);
		}

		// **Step 3: Find the Enrolled Course**

		const enrolled_courses = existingUser.enrolled_courses; // Assuming this is an array

		const courseIndex = enrolled_courses.findIndex(
			(course: any) => course.course_id === course_id
		);

		if (courseIndex === -1) {
			return NextResponse.json(
				{ error: "User is not enrolled in the specified course." },
				{ status: 400 }
			);
		}

		// **Step 4: Validate Lecture and Chapter**

		// Retrieve all chapter IDs for the course
		const chapterIds = await getChapterIds(course_id);

		if (chapterIds.length === 0) {
			return NextResponse.json(
				{ error: "No Chapters found for the specified course." },
				{ status: 404 }
			);
		}

		// Retrieve all lecture IDs for the Chapters
		const lectureIds = await getLectureIds(chapterIds);

		if (lectureIds.length === 0) {
			return NextResponse.json(
				{ error: "No Lectures found for the specified course." },
				{ status: 404 }
			);
		}

		// Check if the provided lectureId exists within the course
		if (!lectureIds.includes(lectureId)) {
			return NextResponse.json(
				{
					error: "The specified lecture does not belong to the given course.",
				},
				{ status: 400 }
			);
		}

		// **Step 5: Update Completed Lectures**

		// Initialize completedLectures if not present
		if (!enrolled_courses[courseIndex].completedLectures) {
			enrolled_courses[courseIndex].completedLectures = [];
		}

		const completedLectures: string[] =
			enrolled_courses[courseIndex].completedLectures;

		if (isCompleted) {
			// Add lectureId if not already present
			if (!completedLectures.includes(lectureId)) {
				completedLectures.push(lectureId);
			}
		} else {
			// Remove lectureId if present
			const lecturePos = completedLectures.indexOf(lectureId);
			if (lecturePos !== -1) {
				completedLectures.splice(lecturePos, 1);
			}
		}

		// **Step 6: Calculate New Progress**

		const totalLectures = lectureIds.length;
		const completedCount = completedLectures.length;
		const newProgress =
			totalLectures === 0
				? 0
				: Math.floor((completedCount / totalLectures) * 100);

		// **Step 7: Update Enrolled Course**

		enrolled_courses[courseIndex].progress = newProgress;
		enrolled_courses[courseIndex].completedLectures = completedLectures;

		// **Step 8: Update User in the Database**

		const updatedUser = await db
			.update(User)
			.set({ enrolled_courses: enrolled_courses })
			.where(eq(User.id, user_id))
			.returning();

		// **Step 9: Prepare Completion Counter**

		const completionCounter = `${completedCount}/${totalLectures} completed`;

		// **Step 10: Return Success Response**

		return NextResponse.json(
			{
				message: "Lecture completion status updated successfully.",
				updatedProgress: newProgress,
				completionCounter: completionCounter,
				updatedEnrolledCourses: enrolled_courses[courseIndex],
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error marking lecture as complete:", error);
		return NextResponse.json(
			{
				error: "An error occurred while updating lecture completion status.",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// src/app/api/User/[user_id]/enrollCourses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { User } from "@/db/schemas/User";
import { Orders } from "@/db/schemas/Orders";
import { Chapters } from "@/db/schemas/Chapters"; // Import the Chapters schema
import { Lectures } from "@/db/schemas/Lectures"; // Import the Lectures schema
import { eq, inArray } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export async function GET(
	req: NextRequest,
	{ params }: { params: { user_id: string } }
) {
	try {
		const user_id = params.user_id;
		const url = new URL(req.url);
		const progressQuery = url.searchParams.get("progress"); // Optional query param for progress

		if (!user_id) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// **Session Validation Starts Here**
		const token = await getToken({ req });

		// Check if the User is authenticated
		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if the token User ID matches the user_id parameter
		if (token.id !== user_id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}
		// **Session Validation Ends Here**

		// Step 1: Check if the User exists
		const foundUsers = await db
			.select({
				enrolled_courses: User.enrolled_courses,
			})
			.from(User)
			.where(eq(User.id, user_id));

		if (foundUsers.length === 0) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Extract enrolled_courses from User
		const enrolled_courses = foundUsers[0].enrolled_courses || [];

		// Step 2: Filter by progress if provided
		let filteredCourses = enrolled_courses;
		if (progressQuery !== null) {
			const progressValue = parseInt(progressQuery, 10);
			filteredCourses = enrolled_courses.filter(
				(course: any) => course.progress === progressValue
			);
		}

		// Step 3: Get the list of courseIds from the filtered enrolled Courses
		const courseIds = filteredCourses.map(
			(course: any) => course.course_id
		);

		// console.log("foundUsers ✔️✔️ courseIds",courseIds)

		// Step 4: Fetch all Orders for the User
		const userOrders = await db
			.select({
				items: Orders.items,
			})
			.from(Orders)
			.where(eq(Orders.user_id, user_id));

		// Debugging: Log the fetched Orders
		// console.log('Fetched User Orders:', JSON.stringify(userOrders, null, 2));

		// Step 5: Extract purchased courseIds from Orders
		const purchasedCourseIds = new Set<string>();
		userOrders.forEach((order) => {
			const items = order.items;

			// Debugging: Log the items
			console.log(
				`Order ID: ${order.id}, Items: ${JSON.stringify(items)}`
			);

			if (Array.isArray(items)) {
				items.forEach((item: any) => {
					if (item.course_id) {
						purchasedCourseIds.add(item.course_id);
					}
				});
			} else {
				console.warn(
					`Order ID: ${order.id} has malformed items:`,
					items
				);
				// Optionally, handle single objects or skip
				// If items is an object, you can convert it to an array
				if (typeof items === "object" && items !== null) {
					if (items.course_id) {
						purchasedCourseIds.add(items.course_id);
					}
				}
			}
		});

		// Step 6: Filter enrolled_courses to only include Courses that have been purchased
		const validEnrolledCourses = filteredCourses.filter((course: any) =>
			purchasedCourseIds.has(course.course_id)
		);

		// Step 7: Fetch Chapters for valid enrolled Courses (only IDs)
		const validCourseIds = validEnrolledCourses.map(
			(course) => course.course_id
		);

		const chaptersList = await db
			.select({
				id: Chapters.id,
				course_id: Chapters.course_id,
			})
			.from(Chapters)
			.where(inArray(Chapters.course_id, validCourseIds));

		// Organize chapter IDs by course_id
		const chaptersByCourseId = chaptersList.reduce(
			(acc: any, chapter: any) => {
				if (!acc[chapter.course_id]) {
					acc[chapter.course_id] = [];
				}
				acc[chapter.course_id].push(chapter.id);
				return acc;
			},
			{}
		);

		// Collect chapterIds
		const chapterIds = chaptersList.map((chapter) => chapter.id);

		// Fetch Lectures for these Chapters (only IDs)
		const lecturesList = await db
			.select({
				id: Lectures.id,
				chapter_id: Lectures.chapter_id,
			})
			.from(Lectures)
			.where(inArray(Lectures.chapter_id, chapterIds));

		// Organize lecture IDs by chapter_id
		const lecturesByChapterId = lecturesList.reduce(
			(acc: any, lecture: any) => {
				if (!acc[lecture.chapter_id]) {
					acc[lecture.chapter_id] = [];
				}
				acc[lecture.chapter_id].push(lecture.id);
				return acc;
			},
			{}
		);

		// Build the response with only IDs
		const coursesWithIds = validEnrolledCourses.map((course: any) => {
			const courseChaptersIds =
				chaptersByCourseId[course.course_id] || [];

			const chaptersWithLectureIds = courseChaptersIds.map(
				(chapter_id: string) => {
					const lectureIds = lecturesByChapterId[chapter_id] || [];
					return {
						chapter_id,
						lectureIds,
					};
				}
			);

			return {
				course_id: course.course_id,
				progress: course.progress,
				completedLectures: course.completedLectures,
				Chapters: chaptersWithLectureIds,
			};
		});

		// Return the valid enrolled Courses with only IDs
		return NextResponse.json(coursesWithIds);
	} catch (error) {
		console.error("Error fetching enrolled Courses:", error);
		return NextResponse.json(
			{ error: "Failed to fetch enrolled Courses" },
			{ status: 500 }
		);
	}
}

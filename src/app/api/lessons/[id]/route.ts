import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Lectures } from "@/db/schemas/Lectures";
import { Chapters } from "@/db/schemas/Chapters";
import { User } from "@/db/schemas/User";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const lessonId = params.id;

		// Get the User session
		const token = await getToken({ req });

		// Fetch the lesson data with all necessary columns
		const lessonData = await db
			.select({
				id: Lectures.id,
				title: Lectures.title,
				video_url: Lectures.video_url,
				is_locked: Lectures.is_locked,
				is_preview: Lectures.is_preview,
				chapter_id: Lectures.chapter_id, // Ensure chapter_id is included
				// Include other necessary columns
			})
			.from(Lectures)
			.where(eq(Lectures.id, lessonId))
			.limit(1);

		if (lessonData.length === 0) {
			return NextResponse.json(
				{ error: "Lesson not found" },
				{ status: 404 }
			);
		}

		let lesson = lessonData[0];
		// console.log('Fetched lesson:', lesson); // For debugging

		if (token && token.sub) {
			const user_id = token.sub as string;

			// Fetch the User's enrolled Courses
			const userData = await db
				.select({
					enrolled_courses: User.enrolled_courses,
				})
				.from(User)
				.where(eq(User.id, user_id))
				.limit(1);

			if (userData.length > 0) {
				const enrolled_courses = userData[0].enrolled_courses || [];

				// Get the chapter data to retrieve the course_id
				const chapterData = await db
					.select({
						course_id: Chapters.course_id,
					})
					.from(Chapters)
					.where(eq(Chapters.id, lesson.chapter_id))
					.limit(1);

				if (chapterData.length > 0) {
					const course_id = chapterData[0].course_id;

					// Check if the User is enrolled in this course
					const isEnrolled = enrolled_courses.some(
						(course: any) => course.course_id === course_id
					);

					if (isEnrolled) {
						// Set is_locked to false
						lesson = {
							...lesson,
							is_locked: false,
						};
					}
				}
			}
		}

		return NextResponse.json(lesson);
	} catch (error) {
		console.error("Error fetching lesson:", error);
		return NextResponse.json(
			{ error: "Failed to fetch lesson", details: error.message },
			{ status: 500 }
		);
	}
}

// // src/app/api/lessons/[id]/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/db';
// import { Lectures } from '@/db/schemas/Lectures';
// import { Chapters } from '@/db/schemas/Chapters';
// import { User } from '@/db/schemas/User';
// import { eq } from 'drizzle-orm';
// import { getToken } from 'next-auth/jwt';

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const lessonId = params.id;

//     // Get the User session
//     const token = await getToken({ req });

//     // Fetch the lesson data
//     const lessonData = await db
//       .select()
//       .from(Lectures)
//       .where(eq(Lectures.id, lessonId))
//       .limit(1);

//     if (lessonData.length === 0) {
//       return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
//     }

//     let lesson = lessonData[0];

//     if (token && token.sub) {
//       const user_id = token.sub as string;

//       // Fetch the User's enrolled Courses
//       const userData = await db
//         .select({
//           enrolled_courses: User.enrolled_courses,
//         })
//         .from(User)
//         .where(eq(User.id, user_id))
//         .limit(1);

//       if (userData.length > 0) {
//         const enrolled_courses = userData[0].enrolled_courses || [];

//         // Get the chapter data to retrieve the course_id
//         const chapterData = await db
//           .select({
//             course_id: Chapters.course_id,
//           })
//           .from(Chapters)
//           .where(eq(Chapters.id, lesson.chapter_id))
//           .limit(1);

//         if (chapterData.length > 0) {
//           const course_id = chapterData[0].course_id;

//           // Check if the User is enrolled in this course
//           const isEnrolled = enrolled_courses.some(
//             (course: any) => course.course_id === course_id
//           );

//           if (isEnrolled) {
//             // Set is_locked to false
//             lesson = {
//               ...lesson,
//               is_locked: false,
//             };
//           }
//         }
//       }
//     }

//     return NextResponse.json(lesson);
//   } catch (error) {
//     console.error('Error fetching lesson:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch lesson' },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse, NextRequest } from 'next/server';
// import { db } from '@/db'; // Assuming this is your Drizzle DB instance
// import { Lectures } from '@/db/schemas/Lectures'; // Importing the Lectures table schema
// import { eq } from 'drizzle-orm';

// // API to get a lecture by its ID
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params; // Lecture ID from the URL

//     // Fetch the lecture from the database using Drizzle ORM
//     const lecture = await db
//       .select()
//       .from(Lectures)
//       .where(eq(Lectures.id, id))
//       .limit(1);

//     // If no lecture is found, return a 404 response
//     if (!lecture || lecture.length === 0) {
//       return NextResponse.json({ message: 'Lecture not found' }, { status: 404 });
//     }

//     // Return the lecture data in the response
//     return NextResponse.json(lecture[0], { status: 200 });
//   } catch (error) {
//     console.error('Error fetching lecture:', error);
//     return NextResponse.json(
//       { message: 'An error occurred while fetching the lecture', error: error.message },
//       { status: 500 }
//     );
//   }
// }

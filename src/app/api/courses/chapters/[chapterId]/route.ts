// src/app/api/Courses/Chapters/[chapter_id]/route.js
import { NextResponse } from "next/server";
import { db } from "@/db";
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";
import { Courses } from "@/db/schemas/Courses";
import { eq } from "drizzle-orm";
import { Questionnaires } from "@/db/schemas/questionnaire";

// API handler to fetch the chapter by chapter_id and then get all Chapters of the same course with their lessons and extras
export async function GET(req, { params }) {
	const { chapter_id } = params;

	try {
		// 1. Fetch the chapter by chapter_id
		const chapterResult = await db
			.select({
				id: Chapters.id,
				course_id: Chapters.course_id,
				questionnaire_id: Chapters.questionnaire_id, // ediited by jayesh on 2021-09-29
			})
			.from(Chapters)
			.where(eq(Chapters.id, chapter_id))
			.limit(1);

		if (!chapterResult || chapterResult.length === 0) {
			return NextResponse.json(
				{ message: "Chapter not found" },
				{ status: 404 }
			);
		}

		const chapter = chapterResult[0];
		const course_id = chapter.course_id;

		// 2. Fetch the course to get extras and other course details
		const courseResult = await db
			.select({
				id: Courses.id,
				title: Courses.title,
				price: Courses.price,
				description: Courses.description,
				thumbnail: Courses.thumbnail,
				extras: Courses.extras,
				creatorId: Courses.user_id, // Ensure this references the course creator
			})
			.from(Courses)
			.where(eq(Courses.id, course_id))
			.limit(1);

		if (!courseResult || courseResult.length === 0) {
			return NextResponse.json(
				{ message: "Course not found" },
				{ status: 404 }
			);
		}

		const course = courseResult[0];

		// 3. Fetch all Chapters that belong to the same course
		const allChapters = await db
			.select({
				id: Chapters.id,
				title: Chapters.title,
				order: Chapters.order,
				questionnaire_id: Chapters.questionnaire_id, // ediited by jayesh on 2021-09-29
			})
			.from(Chapters)
			.where(eq(Chapters.course_id, course_id))
			.orderBy(Chapters.order);

		// 4. Fetch lessons for each chapter
		const chaptersWithLessons = await Promise.all(
			allChapters.map(async (chapter) => {
				const chapterLessons = await db
					.select({
						id: Lectures.id,
						title: Lectures.title,
						description: Lectures.description,
						video_url: Lectures.video_url,
						is_locked: Lectures.is_locked,
						is_preview: Lectures.is_preview,
						duration: Lectures.duration,
					})
					.from(Lectures)
					.where(eq(Lectures.chapter_id, chapter.id));

				return {
					...chapter,
					lessons: chapterLessons,
				};
			})
		);

		// 5. Fetch Questionnaires linked to the chapter
		const allQuestionnares = await db
			.select({
				id: Questionnaires.id,
				title: Questionnaires.title,
			})
			.from(Questionnaires)
			.where(eq(Questionnaires.chapter_id, chapter_id));
		// .orderBy(Chapters.order);
		console.log("fetch course chapter id", allQuestionnares);

		// 6. Return the response
		return NextResponse.json(
			{
				message:
					"Chapters with lessons and course extras fetched successfully",
				title: course.title,
				id: course.id,
				price: course.price,
				thumbnail: course.thumbnail,
				creatorId: course.creatorId,
				extras: course.extras,
				Chapters: chaptersWithLessons,
				Questionnaires: allQuestionnares, // ediited by jayesh on 2021-09-29
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error(
			"Error fetching Chapters, lessons, and course extras:",
			error
		);
		return NextResponse.json(
			{
				message: "Failed to fetch Chapters, lessons, and course extras",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

// import { NextResponse } from 'next/server';
// import { db } from '@/db';
// import { Chapters } from '@/db/schemas/Chapters';
// import { Lectures } from '@/db/schemas/Lectures';
// import { Courses } from '@/db/schemas/Courses';
// import { eq } from 'drizzle-orm';

// // API handler to fetch the chapter by chapter_id and then get all Chapters of the same course with their lessons and extras
// export async function GET(req, { params }) {
//   const { chapter_id } = params;

//   try {
//     // **1. Fetch the chapter by chapter_id**
//     const chapterResult = await db
//       .select({
//         id: Chapters.id,
//         course_id: Chapters.course_id,
//         // Include other necessary columns from the Chapters table
//       })
//       .from(Chapters)
//       .where(eq(Chapters.id, chapter_id))
//       .limit(1);

//     if (!chapterResult || chapterResult.length === 0) {
//       return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
//     }

//     const chapter = chapterResult[0];
//     const course_id = chapter.course_id;

//     // **2. Fetch the course to get extras and other course details**
//     const courseResult = await db
//       .select({
//         id: Courses.id,
//         extras: Courses.extras,
//         creatorId: Courses.user_id, // Corrected mapping
//         // Include other necessary columns
//       })
//       .from(Courses)
//       .where(eq(Courses.id, course_id))
//       .limit(1);

//     if (!courseResult || courseResult.length === 0) {
//       return NextResponse.json({ message: 'Course not found' }, { status: 404 });
//     }

//     const course = courseResult[0];

//     // **3. Fetch all Chapters that belong to the same course**
//     const allChapters = await db
//       .select({
//         id: Chapters.id,
//         title: Chapters.title,
//         order: Chapters.order,
//         // Include other necessary columns
//       })
//       .from(Chapters)
//       .where(eq(Chapters.course_id, course_id))
//       .orderBy(Chapters.order);

//     // **4. For each chapter, fetch its lessons**
//     const chaptersWithLessons = await Promise.all(
//       allChapters.map(async (chapter) => {
//         const chapterLessons = await db
//           .select({
//             id: Lectures.id,
//             title: Lectures.title,
//             video_url: Lectures.video_url,
//             is_locked: Lectures.is_locked,
//             is_preview: Lectures.is_preview,
//             // Include other necessary columns
//           })
//           .from(Lectures)
//           .where(eq(Lectures.chapter_id, chapter.id));

//         return {
//           ...chapter,
//           lessons: chapterLessons,
//         };
//       })
//     );

//     // **5. Return the response including 'creatorId'**
//     return NextResponse.json(
//       {
//         message: 'Chapters with lessons and course extras fetched successfully',
//         id: course.id,
//         creatorId: course.creatorId, // This now correctly maps to 'user_id' from 'Courses' table
//         extras: course.extras,
//         Chapters: chaptersWithLessons,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error fetching Chapters, lessons, and course extras:', error);
//     return NextResponse.json(
//       { message: 'Failed to fetch Chapters, lessons, and course extras', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from 'next/server';
// import { db } from '@/db'; // Assuming you're using Drizzle ORM with a db connection setup
// import { Chapters } from '@/db/schemas/Chapters'; // Import the Chapters schema
// import { Lectures } from '@/db/schemas/Lectures'; // Import the lessons schema
// import { Courses } from '@/db/schemas/Courses'; // Import the Courses schema
// import { eq } from 'drizzle-orm'; // Drizzle ORM query helper

// // API handler to fetch the chapter by chapter_id and then get all Chapters of the same course with their lessons and extras
// export async function GET(req: Request, { params }: { params: { chapter_id: string } }) {
//   const { chapter_id } = params;

//   try {
//     // 1. Fetch the chapter by chapter_id
//     const chapter = await db
//       .select()
//       .from(Chapters)
//       .where(eq(Chapters.id, chapter_id))
//       .limit(1);

//     if (!chapter || chapter.length === 0) {
//       return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
//     }

//     const course_id = chapter[0].course_id; // Get course_id from the chapter

//     // 2. Fetch the course to get extras and other course details
// const course = await db
//   .select({
//     extras: Courses.extras, // Fetch only the extras field from the course
//   })
//   .from(Courses)
//   .where(eq(Courses.id, course_id))
//   .limit(1);

// if (!course || course.length === 0) {
//   return NextResponse.json({ message: 'Course not found' }, { status: 404 });
// }

//     // 3. Fetch all Chapters that belong to the same course
//     const allChapters = await db
//       .select()
//       .from(Chapters)
//       .where(eq(Chapters.course_id, course_id))
//       .orderBy(Chapters.order); // Optionally, order by chapter order

//     // 4. For each chapter, fetch its lessons
//     const chaptersWithLessons = await Promise.all(
//       allChapters.map(async (chapter) => {
//         const chapterLessons = await db
//           .select()
//           .from(Lectures)
//           .where(eq(Lectures.chapter_id, chapter.id));

//         return {
//           ...chapter,
//           lessons: chapterLessons, // Add lessons to the chapter object
//         };
//       })
//     );

//     return NextResponse.json({
//       message: 'Chapters with lessons and course extras fetched successfully',
//       extras: course[0].extras, // Include course extras in the response
//       Chapters: chaptersWithLessons
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching Chapters, lessons, and course extras:', error);
//     return NextResponse.json({ message: 'Failed to fetch Chapters, lessons, and course extras', error: error.message }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { db } from '@/db'; // Assuming you're using Drizzle ORM with a db connection setup
// import { Chapters } from '@/db/schemas/Chapters'; // Import the Chapters schema
// import { Lectures } from '@/db/schemas/Lectures'; // Import the lessons schema
// import { eq } from 'drizzle-orm'; // Drizzle ORM query helper

// // API handler to fetch the chapter by chapter_id and then get all Chapters of the same course with their lessons
// export async function GET(req: Request, { params }: { params: { chapter_id: string } }) {
//   const { chapter_id } = params;

//   try {
//     // 1. Fetch the chapter by chapter_id
//     const chapter = await db
//       .select()
//       .from(Chapters)
//       .where(eq(Chapters.id, chapter_id))
//       .limit(1);

//     if (!chapter || chapter.length === 0) {
//       return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
//     }

//     const course_id = chapter[0].course_id; // Get course_id from the chapter

//     // 2. Fetch all Chapters that belong to the same course
//     const allChapters = await db
//       .select()
//       .from(Chapters)
//       .where(eq(Chapters.course_id, course_id))
//       .orderBy(Chapters.order); // Optionally, order by chapter order

//     // 3. For each chapter, fetch its lessons
//     const chaptersWithLessons = await Promise.all(
//       allChapters.map(async (chapter) => {
//         const chapterLessons = await db
//           .select()
//           .from(Lectures)
//           .where(eq(Lectures.chapter_id, chapter.id));

//         return {
//           ...chapter,
//           lessons: chapterLessons, // Add lessons to the chapter object
//         };
//       })
//     );

//     return NextResponse.json({
//       message: 'Chapters with lessons fetched successfully',
//       Chapters: chaptersWithLessons,
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching Chapters and lessons:', error);
//     return NextResponse.json({ message: 'Failed to fetch Chapters and lessons', error: error.message }, { status: 500 });
//   }
// }

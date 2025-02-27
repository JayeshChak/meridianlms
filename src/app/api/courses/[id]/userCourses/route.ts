import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Assuming db is your Drizzle ORM instance
import { Courses } from "@/db/schemas/Courses"; // Import Courses schema
import { eq, and, sql } from "drizzle-orm"; // For building conditions

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const course_id = params.id;
	const { searchParams } = new URL(req.url);
	const is_published = searchParams.get("is_published") === "true"; // Convert query param to boolean

	try {
		// First, fetch the current course to find the user_id (instructor) who created it
		const currentCourse = await db
			.select({
				id: Courses.id,
				user_id: Courses.user_id,
			})
			.from(Courses)
			.where(eq(Courses.id, course_id))
			.limit(1);

		if (!currentCourse || currentCourse.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: `Course not found for ID: ${course_id}`,
				},
				{ status: 404 }
			);
		}

		const { user_id } = currentCourse[0];

		// Fetch all other Courses created by the same User (instructor) excluding the current course
		const similarCourses = await db
			.select({
				id: Courses.id,
				title: Courses.title,
				price: Courses.price,
				demo_video_url: Courses.demo_video_url,
				is_published: Courses.is_published,
				enrolled_count: Courses.enrolled_count,
				lesson: Courses.lesson,
				duration: Courses.duration,
				thumbnail: Courses.thumbnail,
				estimated_price: Courses.estimated_price,
				is_free: Courses.is_free,
				Categories: Courses.Categories,
			})
			.from(Courses)
			.where(
				and(
					eq(Courses.user_id, user_id),
					sql`${Courses.id} != ${course_id}`, // Exclude the current course
					eq(Courses.is_published, is_published) // Use the is_published query parameter
				)
			);

		if (!similarCourses || similarCourses.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: `No similar Courses found for User ID: ${user_id} and is_published: ${is_published}`,
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: similarCourses,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching User similar Courses",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

// // src/app/api/Courses/[id]/userCourses/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/db'; // Assuming db is your Drizzle ORM instance
// import { Courses } from '@/db/schemas/Courses'; // Import Courses schema
// import { eq, and, sql } from 'drizzle-orm'; // For building conditions

// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   const course_id = params.id;

//   try {
//     // First, fetch the current course to find the user_id (instructor) who created it
//     const currentCourse = await db
//       .select({
//         id: Courses.id,
//         user_id: Courses.user_id,
//       })
//       .from(Courses)
//       .where(eq(Courses.id, course_id))
//       .limit(1);

//     if (!currentCourse || currentCourse.length === 0) {
//       return NextResponse.json({
//         success: false,
//         message: `Course not found for ID: ${course_id}`,
//       }, { status: 404 });
//     }

//     const { user_id } = currentCourse[0];

//     // id, title, lesson, duration, thumbnail, price, estimated_price, is_free, Categories

//     // Fetch all other Courses created by the same User (instructor) excluding the current course
//     const similarCourses = await db
//       .select({
//         id: Courses.id,
//         title: Courses.title,
//         // description: Courses.description,
//         price: Courses.price,
//         demo_video_url: Courses.demo_video_url,
//         is_published: Courses.is_published,
//         enrolled_count: Courses.enrolled_count,
//         lesson: Courses.lesson,
//         duration: Courses.duration,
//         thumbnail: Courses.thumbnail,
//         estimated_price: Courses.estimated_price,
//         is_free: Courses.is_free,
//         Categories: Courses.Categories,

//       })
//       .from(Courses)
//       .where(
//         and(
//           eq(Courses.user_id, user_id),
//           sql`${Courses.id} != ${course_id}` // Exclude the current course
//         )
//       );

//     if (!similarCourses || similarCourses.length === 0) {
//       return NextResponse.json({
//         success: false,
//         message: `No similar Courses found for User ID: ${user_id}`,
//       }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: similarCourses,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Error fetching User similar Courses',
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

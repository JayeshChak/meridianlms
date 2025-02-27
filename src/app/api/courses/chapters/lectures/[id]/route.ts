import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the path to your database connection
import { Lectures } from "@/db/schemas/Lectures"; // Adjust path as necessary
import { eq, sql } from "drizzle-orm";
import { Chapters } from "@/db/schemas/Chapters";
import { Courses } from "@/db/schemas/Courses";

// Utility function to convert minutes to hours
const convertMinutesToHours = (totalMinutes: number) => {
	return (totalMinutes / 60).toFixed(2) + " hours";
};

// Update course duration based on chapter durations
const updateCourseDuration = async (course_id: string) => {
	const totalDurationInMinutes = await db
		.select({
			totalDuration: sql`SUM(CAST(SPLIT_PART(Chapters.duration, ' ', 1) AS int))`,
		})
		.from(Chapters)
		.where(eq(Chapters.course_id, course_id))
		.then((res) => res[0]?.totalDuration || 0);

	const newCourseDuration = convertMinutesToHours(totalDurationInMinutes);

	await db
		.update(Courses)
		.set({ duration: newCourseDuration })
		.where(eq(Courses.id, course_id))
		.returning();
};

// Update chapter duration based on lecture durations
const updateChapterDuration = async (chapter_id: string) => {
	const totalDurationInMinutes = await db
		.select({ totalDuration: sql`SUM(CAST(Lectures.duration AS int))` })
		.from(Lectures)
		.where(eq(Lectures.chapter_id, chapter_id))
		.then((res) => res[0]?.totalDuration || 0);

	const updatedChapter = await db
		.update(Chapters)
		.set({ duration: `${totalDurationInMinutes} minutes` })
		.where(eq(Chapters.id, chapter_id))
		.returning();

	return updatedChapter[0]?.course_id;
};

// Delete a lecture by ID and update durations accordingly
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const lectureId = params.id;

	try {
		if (!lectureId) {
			return NextResponse.json(
				{ message: "Lecture ID is required." },
				{ status: 400 }
			);
		}

		const lecture = await db
			.select()
			.from(Lectures)
			.where(eq(Lectures.id, lectureId))
			.then((res) => res[0]);

		if (!lecture) {
			return NextResponse.json(
				{ message: "Lecture not found." },
				{ status: 404 }
			);
		}

		await db.delete(Lectures).where(eq(Lectures.id, lectureId)).returning();

		// Update chapter and course durations
		const course_id = await updateChapterDuration(lecture.chapter_id);
		if (course_id) {
			await updateCourseDuration(course_id);
		}

		return NextResponse.json(
			{ message: "Lecture deleted successfully." },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Error deleting lecture.", error: error.message },
			{ status: 500 }
		);
	}
}

// Update a lecture by ID
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const lectureId = params.id;

//   try {
//     const body = await req.json();
//     const { title, description, duration, video_url, is_preview, order } = body;

//     // Validate the lecture ID
//     if (!lectureId) {
//       return NextResponse.json(
//         { message: "Lecture ID is required." },
//         { status: 400 }
//       );
//     }

//     // Validate required fields if they need to be updated
//     if (
//       !title &&
//       !duration &&
//       !video_url &&
//       !description &&
//       is_preview === undefined &&
//       !order
//     ) {
//       return NextResponse.json(
//         { message: "At least one field is required to update." },
//         { status: 400 }
//       );
//     }

//     // Prepare the update data
//     const updateData: any = {};
//     if (title) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (duration) updateData.duration = duration;
//     if (video_url) updateData.video_url = video_url;
//     if (is_preview !== undefined) updateData.is_preview = is_preview;
//     if (order) updateData.order = order;

//     // Update the lecture in the database
//     const updatedLecture = await db
//       .update(Lectures)
//       .set(updateData)
//       .where(eq(Lectures.id, lectureId))
//       .returning();

//     if (!updatedLecture) {
//       return NextResponse.json(
//         { message: "Lecture not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Lecture updated successfully.", lecture: updatedLecture },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error updating lecture.", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// Update a lecture by ID and update durations accordingly
export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const lectureId = params.id;

	try {
		const body = await req.json();
		const { title, description, duration, video_url, is_preview, order } =
			body;

		// Validate the lecture ID
		if (!lectureId) {
			return NextResponse.json(
				{ message: "Lecture ID is required." },
				{ status: 400 }
			);
		}

		// Validate required fields if they need to be updated
		if (
			!title &&
			!duration &&
			!video_url &&
			!description &&
			is_preview === undefined &&
			!order
		) {
			return NextResponse.json(
				{ message: "At least one field is required to update." },
				{ status: 400 }
			);
		}

		// Prepare the update data
		const updateData: any = {};
		if (title) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (duration) updateData.duration = duration;
		if (video_url) updateData.video_url = video_url;
		if (is_preview !== undefined) updateData.is_preview = is_preview;
		if (order) updateData.order = order;

		// Update the lecture in the database
		const updatedLecture = await db
			.update(Lectures)
			.set(updateData)
			.where(eq(Lectures.id, lectureId))
			.returning();

		if (!updatedLecture.length) {
			return NextResponse.json(
				{ message: "Lecture not found." },
				{ status: 404 }
			);
		}

		// Update chapter and course durations
		const course_id = await updateChapterDuration(
			updatedLecture[0].chapter_id
		);
		if (course_id) {
			await updateCourseDuration(course_id);
		}

		return NextResponse.json(
			{
				message: "Lecture updated successfully.",
				lecture: updatedLecture,
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Error updating lecture.", error: error.message },
			{ status: 500 }
		);
	}
}

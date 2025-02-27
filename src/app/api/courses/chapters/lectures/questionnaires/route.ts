import { NextResponse } from "next/server";
import { db } from "@/db";
import { Lectures } from "@/db/schemas/Lectures";
import { Chapters } from "@/db/schemas/Chapters";
import { CourseQuestionnaires } from "@/db/schemas/coursequestionnaires";
import { Questionnaires } from "@/db/schemas/questionnaire";
import { eq } from "drizzle-orm";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		console.log(
			"Fetching course Questionnaires for lecture ID:",
			params.id
		);

		// Step 1: Get chapter_id from the Lectures table
		const lecture = await db
			.select({ chapter_id: Lectures.chapter_id })
			.from(Lectures)
			.where(eq(Lectures.id, params.id))
			.limit(1);

		if (!lecture || lecture.length === 0) {
			return NextResponse.json(
				{ error: "Lecture not found" },
				{ status: 404 }
			);
		}

		const chapter_id = lecture[0].chapter_id;

		// Step 2: Get course_id from the Chapters table
		const chapter = await db
			.select({ course_id: Chapters.course_id })
			.from(Chapters)
			.where(eq(Chapters.id, chapter_id))
			.limit(1);

		if (!chapter || chapter.length === 0) {
			return NextResponse.json(
				{ error: "Chapter not found" },
				{ status: 404 }
			);
		}

		const course_id = chapter[0].course_id;

		// Step 3: Fetch all Questionnaires associated with this course_id
		const questionnairesList = await db
			.select({
				id: Questionnaires.id,
				title: Questionnaires.title,
			})
			.from(CourseQuestionnaires)
			.innerJoin(
				Questionnaires,
				eq(CourseQuestionnaires.questionnaire_id, Questionnaires.id)
			)
			.where(eq(CourseQuestionnaires.course_id, course_id));

		return NextResponse.json({
			course_id,
			Questionnaires: questionnairesList,
		});
	} catch (error) {
		console.error("Error fetching course Questionnaires:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { Questionnaires } from "@/db/schemas/questionnaire";
import { questions } from "@/db/schemas/questions";
import { eq } from "drizzle-orm";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("Fetching questionnaire for id:", params.id);

		// Get the questionnaire by its ID
		const questionnaire = await db
			.select()
			.from(Questionnaires)
			.where(eq(Questionnaires.id, params.id))
			.limit(1);

		if (!questionnaire || questionnaire.length === 0) {
			return NextResponse.json(
				{ error: "No questionnaire found with this ID" },
				{ status: 404 }
			);
		}

		// Get all questions for this questionnaire
		const questionsList = await db
			.select()
			.from(questions)
			.where(eq(questions.questionnaire_id, questionnaire[0].id));

		// Format the questions to match the expected interface
		const formattedQuestions = questionsList.map((q) => ({
			id: q.id,
			question: q.question,
			options: q.options, // Assuming options are stored as JSON string
			correct_answer: q.correct_answer,
		}));

		return NextResponse.json({
			id: questionnaire[0].id,
			title: questionnaire[0].title,
			course_id: questionnaire[0].course_id,
			questions: formattedQuestions,
			created_at: questionnaire[0].created_at,
			status: questionnaire[0].status,
		});
	} catch (error) {
		console.error("Error fetching questionnaire:", error);
		return NextResponse.json(
			{ error: "Failed to fetch questionnaire" },
			{ status: 500 }
		);
	}
}

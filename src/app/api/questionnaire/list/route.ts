import { NextResponse } from "next/server";
import { db } from "@/db";
import { Questionnaires } from "@/db/schemas/questionnaire";
import { questions } from "@/db/schemas/questions";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
	try {
		// Log the query attempt
		console.log("Attempting to fetch Questionnaires");

		// Fetch Questionnaires with a simpler query first
		const allQuestionnaires = await db
			.select({
				id: Questionnaires.id,
				title: Questionnaires.title,
				course_id: Questionnaires.course_id,
				created_at: Questionnaires.created_at,
			})
			.from(Questionnaires);

		if (!allQuestionnaires) {
			return NextResponse.json({
				success: true,
				Questionnaires: [],
			});
		}

		console.log("Fetched Questionnaires:", allQuestionnaires);

		// Then fetch questions for each questionnaire
		const formattedQuestionnaires = await Promise.all(
			allQuestionnaires.map(async (questionnaire) => {
				const questionsList = await db
					.select({
						id: questions.id,
						question: questions.question,
						options: questions.options,
						correct_answer: questions.correct_answer,
					})
					.from(questions)
					.where(eq(questions.questionnaire_id, questionnaire.id));

				console.log(
					`Questions for questionnaire ${questionnaire.id}:`,
					questionsList
				);

				return {
					id: questionnaire.id,
					title: questionnaire.title,
					course_id: questionnaire.course_id,
					created_at:
						questionnaire.created_at?.toISOString() ||
						new Date().toISOString(),
					status: questionnaire.status || "active",

					//updated on 2021-09-29 by JC
					questions: questionsList.map(
						(q: {
							id: any;
							question: any;
							options: string;
							correct_answer: any;
						}) => ({
							id: q.id,
							question: q.question,
							options: q.options
								? typeof q.options === "string"
									? JSON.parse(q.options)
									: Array.isArray(q.options)
									? q.options
									: []
								: [],
							correct_answer: q.correct_answer || "",
						})
					),
				};
			})
		);

		return NextResponse.json({
			success: true,
			Questionnaires: formattedQuestionnaires,
		});
	} catch (error) {
		console.error("Error fetching Questionnaires:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch Questionnaires",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

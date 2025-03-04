import { NextResponse } from "next/server";
import { db } from "@/db";
import { Questionnaires } from "@/db/schemas/questionnaire";
import { questions } from "@/db/schemas/questions";
import { CourseQuestionnaires } from "@/db/schemas/coursequestionnaires"; //edited by jayesh chak on 03/02/2025
import { z } from "zod";

const questionnaireSchema = z.object({
	title: z.string().min(1, "Title is required"),
	course_id: z.string().min(1, "Course ID is required"),
	questions: z
		.array(
			z.object({
				question: z.string().min(1, "Question is required"),
				options: z.array(z.string().min(1, "Option cannot be empty")),
				correct_answer: z.string().min(1, "Correct answer is required"),
			})
		)
		.min(1, "At least one question is required"),
	is_required: z.boolean().default(true),
	min_pass_score: z.number().default(80),
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		console.log("Incoming request body:", body);

		const parsedData = questionnaireSchema.parse(body);
		console.log("Parsed data:", parsedData);

		const {
			title,
			course_id,
			questions: questionData,
			is_required,
			min_pass_score,
		} = parsedData;

		// First create the questionnaire
		const [newQuestionnaire] = await db
			.insert(Questionnaires)
			.values({
				title,
				course_id,
				is_required,
				min_pass_score,
			})
			.returning({
				id: Questionnaires.id,
				title: Questionnaires.title,
			});

		if (!newQuestionnaire?.id) {
			throw new Error("Failed to create questionnaire");
		}

		// Then create the questions
		const questionValues = questionData.map((q) => ({
			questionnaire_id: newQuestionnaire.id,
			question: q.question,
			options: JSON.stringify(q.options),
			correct_answer: q.correct_answer,
		}));

		await db.insert(questions).values(questionValues);

		// Insert into course_questionnaires                   //edited by jayesh chak on 03/02/2025
		await db.insert(CourseQuestionnaires).values({
			course_id,
			questionnaire_id: newQuestionnaire.id,
			is_active: true,
		}); //edited by jayesh chak on 03/02/2025

		return NextResponse.json(
			{
				success: true,
				message: "Questionnaire saved successfully",
				data: {
					questionnaire_id: newQuestionnaire.id,
					title: newQuestionnaire.title,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error saving questionnaire:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to save questionnaire",
				details:
					error instanceof z.ZodError ? error.errors : error.message,
			},
			{ status: 500 }
		);
	}
}

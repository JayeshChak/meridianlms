import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, desc, isNotNull, inArray } from "drizzle-orm";
import { QuizAttempts } from "@/db/schemas/QuizAttempts";
import { Chapters } from "@/db/schemas/Chapters";
import { User } from "@/db/schemas/User";

import { getServerSession } from "next-auth/next";
import { options as authOptions } from "@/libs/auth";
import { questions } from "@/db/schemas/questions";
import { getSession } from "next-auth/react";

// Dummy function to get current User id from session; adjust as needed.
async function getCurrentUserId() {
	const session = await getServerSession(authOptions);
	if (!session?.User?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userRecord = await db
		.select({ id: User.id }) // Fetch only required field
		.from(User)
		.where(eq(User.email, session.User.email))
		.limit(1);

	if (!userRecord.length) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return userRecord[0].id;
}

export async function GET(
	req: Request,
	{ params }: { params: { course_id: string } }
) {
	try {
		const user_id = await getCurrentUserId();
		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const questionnaireIds = await db
			.select({ questionnaire_id: Chapters.questionnaire_id })
			.from(Chapters)
			.where(
				and(
					eq(Chapters.course_id, params.course_id),
					isNotNull(Chapters.questionnaire_id)
				)
			)
			.then((results) => results.map((c) => c.questionnaire_id));

		if (!questionnaireIds.length) {
			return NextResponse.json({
				progress: 0,
				totalScore: 0,
				maxScore: 0,
			});
		}

		// Fetch latest attempt for each quiz
		const latestAttempts = await db
			.select({
				questionnaire_id: QuizAttempts.questionnaire_id,
				score: QuizAttempts.score,
			})
			.from(QuizAttempts)
			.where(
				and(
					eq(QuizAttempts.user_id, user_id),
					inArray(QuizAttempts.questionnaire_id, questionnaireIds)
				)
			)
			.orderBy(desc(QuizAttempts.created_at))
			.groupBy(QuizAttempts.questionnaire_id); // Ensures we get the latest per quiz

		// Fetch total possible scores (sum of total questions per quiz)
		const maxScores = await db
			.select({
				questionnaire_id: questions.questionnaire_id,
				count: db.fn.count(questions.id).as("total_questions"), // Uses `as()` properly
			})
			.from(questions)
			.where(inArray(questions.questionnaire_id, questionnaireIds))
			.groupBy(questions.questionnaire_id);

		// Calculate total scores
		const totalScore = latestAttempts.length
			? latestAttempts.reduce(
					(sum, attempt) => sum + (attempt.score || 0),
					0
			  )
			: 0;

		const maxScore = maxScores.length
			? maxScores.reduce(
					(sum, max) => sum + (max.total_questions || 0),
					0
			  )
			: 0;

		const progress = maxScore
			? Math.round((totalScore / maxScore) * 100)
			: 0;

		return NextResponse.json({ progress, totalScore, maxScore });
	} catch (error) {
		console.error("Error fetching progress:", error);
		return NextResponse.json(
			{ error: "Failed to fetch progress" },
			{ status: 500 }
		);
	}
}

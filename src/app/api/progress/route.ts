import { NextResponse } from "next/server";
import { db } from "@/db";
import { getServerSession } from "next-auth/next";
import { QuizAttempts } from "@/db/schemas/QuizAttempts";
import { and, eq, desc } from "drizzle-orm";
import { options as authOptions } from "@/libs/auth";

export async function GET(req: Request) {
	try {
		// Get User session
		const session = await getServerSession(authOptions);
		if (!session?.User?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user_id = session.User.id;

		// Fetch latest quiz scores for the User
		const latestAttempts = await db
			.select({
				questionnaire_id: QuizAttempts.questionnaire_id,
				score: QuizAttempts.score,
			})
			.from(QuizAttempts)
			.where(eq(QuizAttempts.user_id, user_id))
			.orderBy(desc(QuizAttempts.created_at));

		// If no attempts found, return empty progress
		if (!latestAttempts.length) {
			return NextResponse.json({ scores: {} });
		}

		// Format scores as an object { questionnaire_id: score }
		const scores = latestAttempts.reduce((acc, attempt) => {
			acc[attempt.questionnaire_id] = attempt.score;
			return acc;
		}, {} as Record<string, number>);

		return NextResponse.json({ scores });
	} catch (error) {
		console.error("Error fetching progress:", error);
		return NextResponse.json(
			{ error: "Failed to fetch progress" },
			{ status: 500 }
		);
	}
}

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { Questionnaires } from "@/db/schemas/questionnaire";
import { Chapters } from "@/db/schemas/Chapters"; // Ensure correct import
import { eq } from "drizzle-orm";
import { z } from "zod";
import { CourseQuestionnaires } from "@/db/schemas/coursequestionnaires";

// Validation schema for the request body
const assignSchema = z.object({
	questionnaire_id: z.string().min(1, "Questionnaire ID is required"),
	course_id: z.string().min(1, "Course ID is required"),
	chapter_id: z.string().min(1, "Chapter ID is required"),
});

export async function POST(req: NextRequest) {
	try {
		// Parse and validate the request body
		const body = await req.json();
		console.log("Request body:", body);

		const { questionnaire_id, course_id, chapter_id } =
			assignSchema.parse(body);
		console.log("Parsed body:", {
			questionnaire_id,
			course_id,
			chapter_id,
		});

		// 1️⃣ Fetch the questionnaire details
		const [questionnaire] = await db
			.select()
			.from(Questionnaires)
			.where(eq(Questionnaires.id, questionnaire_id))
			.limit(1);

		if (!questionnaire) {
			return NextResponse.json(
				{ success: false, error: "Questionnaire not found" },
				{ status: 404 }
			);
		}

		// 2️⃣ If a chapter is provided, validate that it exists
		if (chapter_id) {
			const [foundChapter] = await db
				.select()
				.from(Chapters)
				.where(eq(Chapters.id, chapter_id))
				.limit(1);

			if (!foundChapter) {
				return NextResponse.json(
					{ success: false, error: "Chapter not found" },
					{ status: 404 }
				);
			}

			// Ensure the chapter belongs to the same course
			if (course_id !== foundChapter.course_id) {
				return NextResponse.json(
					{
						success: false,
						error: "Questionnaire and Chapter must belong to the same Course",
					},
					{ status: 400 }
				);
			}
		}

		// 3️⃣ Check if questionnaire is already linked to the course
		const [existingCourseQuestionnaire] = await db
			.select()
			.from(CourseQuestionnaires)
			.where(eq(CourseQuestionnaires.questionnaire_id, questionnaire_id))
			.limit(1);

		let courseQuestionnaireId: string;

		if (!existingCourseQuestionnaire) {
			// 🆕 Insert into `course_questionnaires`
			const [newCourseQuestionnaire] = await db
				.insert(CourseQuestionnaires)
				.values({
					course_id,
					questionnaire_id,
					is_active: true,
				})
				.returning({ id: CourseQuestionnaires.id });

			if (!newCourseQuestionnaire) {
				console.log("Failed to insert into course_questionnaires");
				return NextResponse.json(
					{
						success: false,
						error: "Failed to link questionnaire to course",
					},
					{ status: 500 }
				);
			}

			courseQuestionnaireId = newCourseQuestionnaire.id;
		} else {
			courseQuestionnaireId = existingCourseQuestionnaire.id;
		}

		console.log("Course Questionnaire ID:", courseQuestionnaireId);

		// 4️⃣ Update the questionnaire with the assigned chapter (or remove chapter_id if not provided)
		console.log("Updating questionnaire with:", { course_id, chapter_id });

		const [updatedQuestionnaire] = await db
			.update(Questionnaires)
			.set({
				course_id,
				chapter_id: chapter_id || null, // Save or clear chapter_id
				id_course_questionnaires_questionnaire_id:
					courseQuestionnaireId, // Link it properly
				updated_at: new Date(),
			})
			.where(eq(Questionnaires.id, questionnaire_id))
			.returning({
				id: Questionnaires.id,
				title: Questionnaires.title,
				chapter_id: Questionnaires.chapter_id,
				course_id: Questionnaires.course_id,
				// id_course_questionnaires_questionnaire_id: courseQuestionnaireId,
			});

		if (!updatedQuestionnaire) {
			console.log("Failed to update questionnaire");
			return NextResponse.json(
				{ success: false, error: "Failed to assign questionnaire" },
				{ status: 500 }
			);
		}

		console.log(
			"Successfully assigned questionnaire:",
			updatedQuestionnaire
		);

		// 5️⃣ If a chapter is provided, update the chapter's questionnaire_id
		if (chapter_id) {
			await db
				.update(Chapters)
				.set({
					questionnaire_id: questionnaire_id, // Assign the questionnaire
				})
				.where(eq(Chapters.id, chapter_id));
		}

		return NextResponse.json({
			success: true,
			message: "Questionnaire assigned successfully",
			data: updatedQuestionnaire,
		});
	} catch (error) {
		console.error("Error assigning questionnaire:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Invalid request data",
				details: error.errors,
			},
			{ status: 400 }
		);
	}
}

// GET endpoint to fetch assignment status
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const questionnaire_id = searchParams.get("questionnaire_id");

		if (!questionnaire_id) {
			return NextResponse.json(
				{ error: "Questionnaire ID is required" },
				{ status: 400 }
			);
		}

		const questionnaire = await db
			.select({
				id: Questionnaires.id,
				chapter_id: Questionnaires.chapter_id,
				course_id: Questionnaires.course_id,
			})
			.from(Questionnaires)
			.where(eq(Questionnaires.id, questionnaire_id))
			.limit(1);

		return NextResponse.json({
			success: true,
			data: questionnaire[0] || null,
		});
	} catch (error) {
		console.error("Error fetching assignment status:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch assignment status",
			},
			{ status: 500 }
		);
	}
}

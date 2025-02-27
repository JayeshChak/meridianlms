// src/app/api/admin/instructor-applications/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { InstructorApplications } from "@/db/schemas/instructor";
import { User } from "@/db/schemas/User";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/libs/auth";

// src/app/api/admin/instructor-applications/route.ts

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		// Authentication (ensure only admins can access)
		const session = await getSession(req);
		if (
			!session ||
			!session.User ||
			!session.User.roles.includes("admin")
		) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Fetch instructor applications with status 'pending'
		const applications = await db
			.select({
				id: InstructorApplications.id,
				user_id: InstructorApplications.user_id,
				instructor_bio: InstructorApplications.instructor_bio,
				qualifications: InstructorApplications.qualifications,
				status: InstructorApplications.status,
				created_at: InstructorApplications.created_at,
				updated_at: InstructorApplications.updated_at,
				name: User.name,
				email: User.email,
			})
			.from(InstructorApplications)
			.leftJoin(User, eq(InstructorApplications.user_id, User.id))
			.where(eq(InstructorApplications.status, "pending"))
			.orderBy(desc(InstructorApplications.created_at));

		return NextResponse.json({ applications }, { status: 200 });
	} catch (error) {
		console.error("Error fetching instructor applications:", error);
		return NextResponse.json(
			{
				message: "Error fetching instructor applications",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

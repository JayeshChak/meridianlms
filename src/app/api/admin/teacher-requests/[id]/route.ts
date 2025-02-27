// src/app/api/admin/instructor-applications/[id]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { InstructorApplications } from "@/db/schemas/instructor";
import { User as users } from "@/db/schemas/User";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/libs/emial/emailService"; // Adjust the path
import { BASE_URL } from "@/actions/constant"; // Adjust the path
import { getSession } from "@/libs/auth";

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
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

		const { id } = params;
		const { action } = await req.json();

		// Fetch the instructor application
		const [application] = await db
			.select()
			.from(InstructorApplications)
			.where(eq(InstructorApplications.id, id));

		if (!application) {
			return NextResponse.json(
				{ message: "Application not found" },
				{ status: 404 }
			);
		}

		// Fetch the User
		const [User] = await db
			.select()
			.from(users)
			.where(eq(users.id, application.user_id));

		if (!User) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		if (action === "approve") {
			// Update the User's roles to include 'instructor'
			await db
				.update(users)
				.set({
					roles: [...User.roles, "instructor"],
				})
				.where(eq(users.id, User.id));

			// Update the application status
			await db
				.update(InstructorApplications)
				.set({ status: "approved" })
				.where(eq(InstructorApplications.id, id));

			// Send approval email
			await sendEmail({
				to: User.email,
				subject: "Instructor Application Approved",
				text: "applicationApproved",
				templateData: {
					name: User.name,
					link: `${BASE_URL}/dashboard`,
				},
			});

			return NextResponse.json(
				{ message: "Application approved" },
				{ status: 200 }
			);
		} else if (action === "reject") {
			// Update the application status
			await db
				.update(InstructorApplications)
				.set({ status: "rejected" })
				.where(eq(InstructorApplications.id, id));

			// Send rejection email
			await sendEmail({
				to: User.email,
				subject: "Instructor Application Rejected",
				text: "applicationRejected",
				templateData: {
					name: User.name,
					supportLink: `${BASE_URL}/support`,
				},
			});

			return NextResponse.json(
				{ message: "Application rejected" },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: "Invalid action" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error updating instructor application:", error);
		return NextResponse.json(
			{ message: "Error", error: error.message },
			{ status: 500 }
		);
	}
}

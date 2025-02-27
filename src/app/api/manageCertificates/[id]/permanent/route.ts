import { NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { Certification } from "@/db/schemas/Certification";
import { Courses } from "@/db/schemas/Courses"; // Import Courses table
import { eq } from "drizzle-orm";

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession(request);
		if (!session?.User) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const certificate_id = params.id;

		// 1️⃣ Remove certificate_id from Courses if any course has it
		await db
			.update(Courses)
			.set({ certificate_id: null }) // Set certificate_id to NULL
			.where(eq(Courses.certificate_id, certificate_id))
			.execute();

		// 2️⃣ Delete the certificate
		await db
			.delete(Certification)
			.where(eq(Certification.id, certificate_id))
			.execute();

		return NextResponse.json({
			success: true,
			message: "Certificate permanently deleted and removed from Courses",
		});
	} catch (error) {
		console.error("Error permanently deleting certificate:", error);
		return NextResponse.json(
			{
				message: "Failed to permanently delete certificate",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

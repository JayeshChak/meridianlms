import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Certification } from "@/db/schemas/Certification";
import { eq } from "drizzle-orm";
import { getSession } from "@/libs/auth";

export async function PATCH(req: NextRequest) {
	try {
		const session = await getSession(req);
		if (!session || !session.User) {
			console.error("❌ Unauthorized request");
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await req.json();
		console.log("✅ Received Request Payload:", body);

		const { course_id } = body;

		if (!course_id || typeof course_id !== "string") {
			console.error("❌ Missing or invalid course_id in request");
			return NextResponse.json(
				{ message: "Invalid or missing course_id" },
				{ status: 400 }
			);
		}

		console.log(`🔍 Unpublishing certificates for course_id: ${course_id}`);

		// ✅ Check if course_id exists before updating
		const existingCertificates = await db
			.select()
			.from(Certification)
			.where(eq(Certification.course_id, course_id))
			.execute();

		if (!existingCertificates || existingCertificates.length === 0) {
			console.error(
				`❌ No certificates found for course_id: ${course_id}`
			);
			return NextResponse.json(
				{ message: "No certificates found for this course" },
				{ status: 404 }
			);
		}

		// ✅ Unpublish all certificates for the given course
		await db
			.update(Certification)
			.set({ is_published: false })
			.where(eq(Certification.course_id, course_id))
			.execute();

		console.log("✅ Successfully unpublished previous certificates");
		return NextResponse.json(
			{ message: "Unpublished previous certificates" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("❌ Error unpublishing certificates:", error);
		return NextResponse.json(
			{
				message: "Failed to unpublish certificates",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

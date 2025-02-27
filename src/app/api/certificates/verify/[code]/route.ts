import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Certification } from "@/db/schemas/Certification";
import { Courses } from "@/db/schemas/Courses";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
	request: NextRequest,
	{ params }: { params: { title: string } }
) {
	try {
		const { title } = params;
		const decodedTitle = decodeURIComponent(title);

		// Query using your existing database schema
		const query = db
			.select({
				id: Certification.id,
				title: Certification.title,
				description: Certification.description,
				is_published: Certification.is_published,
				created_at: Certification.created_at,
				courseTitle: Courses.title,
			})
			.from(Certification)
			.leftJoin(Courses, eq(Certification.id, Courses.certificate_id))
			.where(
				and(
					eq(Certification.title, decodedTitle),
					eq(Certification.is_deleted, false),
					isNull(Certification.deleted_at)
				)
			);

		const certificates = await query.execute();

		if (!certificates || certificates.length === 0) {
			return NextResponse.json(
				{ error: "Certificate not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(certificates[0]);
	} catch (error) {
		console.error("Error finding certificate:", error);
		return NextResponse.json(
			{ error: "Failed to find certificate" },
			{ status: 500 }
		);
	}
}

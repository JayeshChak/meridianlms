import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { Certification } from "@/db/schemas/Certification";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
	const session = await getSession(req);

	if (!session?.User) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get the most recently created certificate template for this instructor
		const [certificate] = await db
			.select()
			.from(Certification)
			.where(
				and(
					eq(Certification.owner_id, session.User.id),
					eq(Certification.is_published, true)
				)
			)
			.orderBy(Certification.created_at, "desc")
			.limit(1);

		if (!certificate) {
			return NextResponse.json(
				{ message: "No certificate template found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			certificate,
			message: "Certificate template fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching certificate template:", error);
		return NextResponse.json(
			{ message: "Failed to fetch certificate template" },
			{ status: 500 }
		);
	}
}

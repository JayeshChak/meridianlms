// src/app/api/Courses/[id]/certificate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { CertificateIssuance } from "@/db/schemas/CertificateIssuance";
import { Certification } from "@/db/schemas/Certification";
import { eq } from "drizzle-orm";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: course_id } = params;

	try {
		// Fetch the certificate issuance related to the given course
		const issuance = await db
			.select()
			.from(CertificateIssuance)
			.where(eq(CertificateIssuance.certificate_id, course_id))
			.limit(1);

		// Check if issuance was found
		if (!issuance || issuance.length === 0) {
			return NextResponse.json(
				{
					message:
						"Certificate issuance not found for the specified course.",
				},
				{ status: 404 }
			);
		}

		const certificate_id = issuance[0].certificate_id;

		// Fetch the related certificate template data
		const certificateTemplate = await db
			.select()
			.from(Certification)
			.where(eq(Certification.id, certificate_id))
			.limit(1);

		// Check if the certificate template was found
		if (!certificateTemplate || certificateTemplate.length === 0) {
			return NextResponse.json(
				{ message: "Certificate template not found." },
				{ status: 404 }
			);
		}

		// Return the certificate template data along with issuance details
		return NextResponse.json({
			certificate_id: certificateTemplate.id,
			certificate_data_url: certificateTemplate[0].certificate_data_url,
			description: certificateTemplate[0].description,
			issued_to: issuance[0].issued_to,
			issued_at: issuance[0].issued_at,
			signature: issuance[0].signature,
			issuance_unique_identifier: issuance[0].issuance_unique_identifier,
		});
	} catch (error) {
		// Log the error details for debugging
		console.error("Error fetching certificate issuance:", error);
		return NextResponse.json(
			{
				message:
					"An internal server error occurred while fetching the certificate.",
			},
			{ status: 500 }
		);
	}
}

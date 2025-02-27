import { NextRequest, NextResponse } from "next/server";
import { CertificateIssuance } from "@/db/schemas/CertificateIssuance";
import { Certification } from "@/db/schemas/Certification";
import { User } from "@/db/schemas/User";
import { db } from "@/db"; // Your Drizzle ORM database connection
import { eq } from "drizzle-orm"; // Ensure this is imported

export const GET = async function (request: NextRequest, { params }) {
	try {
		const { issuance_unique_identifier } = params;

		// Step 1: Fetch the basic certificate issuance information
		const issuedCertificate = await db
			.select({
				id: CertificateIssuance.id,
				certificate_id: CertificateIssuance.certificate_id,
				issued_by: CertificateIssuance.issued_by,
				issued_to: CertificateIssuance.issued_to,
				issuance_unique_identifier:
					CertificateIssuance.issuance_unique_identifier,
				issued_at: CertificateIssuance.issued_at,
				description: CertificateIssuance.description,
				certificate_data_url: Certification.certificate_data_url,
			})
			.from(CertificateIssuance)
			.leftJoin(
				Certification,
				eq(Certification.id, CertificateIssuance.certificate_id)
			)
			.where(
				eq(
					CertificateIssuance.issuance_unique_identifier,
					issuance_unique_identifier
				)
			)
			.limit(1);

		if (!issuedCertificate) {
			return NextResponse.json(
				{ error: "Certificate issuance not found" },
				{ status: 404 }
			);
		}

		// console.log("issuedCertificate",issuedCertificate)
		const { issued_by, issued_to } = issuedCertificate[0];

		// console.log("issued_by",issued_by)

		// Step 2: Fetch issued_by (instructor) and issued_to (student) names separately
		const [issuedByUser] = await db
			.select({
				name: User.name,
			})
			.from(User)
			.where(eq(User.id, issued_by));

		const [issuedToUser] = await db
			.select({
				name: User.name,
			})
			.from(User)
			.where(eq(User.id, issued_to));

		// Logging to verify if the queries returned results
		// console.log('Issued By User:', issuedByUser);
		// console.log('Issued To User:', issuedToUser);

		// Combine the result
		const result = {
			...issuedCertificate,
			issuedByUser: issuedByUser
				? issuedByUser.name
				: "Unknown Instructor",
			issuedToUser: issuedToUser ? issuedToUser.name : "Unknown Student",
		};

		return NextResponse.json({
			message: "Certificate issuance details fetched successfully",
			data: result,
		});
	} catch (error) {
		console.error("Error fetching certificate issuance details:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch certificate issuance details. Please try again.",
			},
			{ status: 500 }
		);
	}
};

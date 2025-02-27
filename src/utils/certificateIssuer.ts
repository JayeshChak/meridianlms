// src/utils/certificateIssuer.ts

import { db } from "@/db";
import { CertificateIssuance } from "@/db/schemas/CertificateIssuance";
import { v4 as uuidv4 } from "uuid";

interface IssueCertificateParams {
	course_id: string;
	certificate_id: string;
	issued_by: string; // User ID of the person issuing the certificate
	issued_to: string; // User ID of the recipient
}

/**
 * Utility function to issue a certificate.
 * @param {IssueCertificateParams} params - Parameters required to issue a certificate.
 * @returns {Promise<string>} - Returns the unique identifier of the issued certificate.
 */
export async function issueCertificate(
	params: IssueCertificateParams
): Promise<string> {
	const { course_id, certificate_id, issued_by, issued_to } = params;

	// Generate a unique identifier for the issued certificate
	const issuance_unique_identifier = `CERT-ISSUE-${uuidv4()}`;

	// Insert the issued certificate into the database
	await db.insert(CertificateIssuance).values({
		id: uuidv4(), // Generate a unique ID for the issuance
		certificate_id,
		issued_by, // The person issuing the certificate
		issued_to, // The recipient
		issuance_unique_identifier,
		description: `Certificate issued for course ${course_id}`,
		issued_at: new Date(), // Timestamp of issuance
	});

	return issuance_unique_identifier;
}

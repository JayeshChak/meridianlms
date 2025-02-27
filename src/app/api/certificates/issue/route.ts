// src/app/api/certificates/issue/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { issueCertificate } from "@/utils/certificateIssuer"; // Import the utility function

// Define the POST handler
export const POST = async function (request: NextRequest) {
	try {
		// Get the session (to access the logged-in User's info)
		const session = await getSession(req);

		// Ensure the User is logged in
		if (!session || !session.User || !session.User.id) {
			return NextResponse.json(
				{
					error: "Unauthorized: User must be logged in to issue certificates.",
				},
				{ status: 401 }
			);
		}

		// Parse the request body (make sure to send the data as JSON)
		const { course_id, certificate_id, issued_to } = await request.json();

		// Validate the inputs
		if (!course_id || !certificate_id || !issued_to) {
			return NextResponse.json(
				{
					error: "Missing required fields: course_id, certificate_id, issued_to",
				},
				{ status: 400 }
			);
		}

		// Use the logged-in User's UUID as the 'issued_by'
		const issued_by = session.User.id; // Get the User ID from the session

		// Call the utility function to issue the certificate
		const issuance_unique_identifier = await issueCertificate({
			course_id,
			certificate_id,
			issued_by,
			issued_to,
		});

		// Return a success response
		return NextResponse.json({
			message: "Certificate issued successfully",
			issuance_unique_identifier,
		});
	} catch (error) {
		console.error("Error issuing certificate:", error);
		return NextResponse.json(
			{ error: "Failed to issue certificate. Please try again." },
			{ status: 500 }
		);
	}
};

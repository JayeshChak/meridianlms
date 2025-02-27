// src/app/api/certificates/save-mine-html/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { Certification } from "@/db/schemas/Certification";
import { z } from "zod";
import sanitizeHtml from "sanitize-html"; // Install if not already: npm install sanitize-html

const certificateHtmlSchema = z.object({
	htmlContent: z.string().min(1),
	fileName: z.string(),
});

export async function POST(req: NextRequest) {
	// Retrieve the session
	const session = await getSession(req);

	// Check if the User is authenticated
	if (!session || !session.User) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	// Extract User roles
	const userRoles: string[] = session.User.roles || [];

	// Define allowed roles
	const allowedRoles = ["superAdmin", "instructor"];

	// Check if the User has at least one of the allowed roles
	const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

	if (!hasAccess) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	// Parse and validate the request body
	let parsedData;
	try {
		const json = await req.json();
		parsedData = certificateHtmlSchema.parse(json);
	} catch (error) {
		return NextResponse.json(
			{
				message: "Invalid input data.",
				errors: (error as z.ZodError).errors,
			},
			{ status: 400 }
		);
	}

	const { htmlContent, fileName } = parsedData;

	try {
		// Sanitize the HTML content to prevent XSS attacks
		const sanitizedHtml = sanitizeHtml(htmlContent, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				img: ["src", "alt", "width", "height"],
				// Add other attributes as needed
			},
		});

		// Validate that all required Placeholders are present
		const requiredPlaceholders = ["%{{username}}", "%{{signature}}"]; // Extend as needed
		const missingPlaceholders = requiredPlaceholders.filter(
			(ph) => !sanitizedHtml.includes(ph)
		);

		if (missingPlaceholders.length > 0) {
			return NextResponse.json(
				{
					message: `Missing Placeholders: ${missingPlaceholders.join(
						", "
					)}`,
				},
				{ status: 400 }
			);
		}

		// Insert the sanitized HTML certificate into the database
		await db.insert(Certification).values({
			owner_id: session.User.id,
			certificate_data_url: sanitizedHtml, // Store the sanitized HTML
			description: "", // Include description if applicable
			unique_identifier: generateUniqueIdentifier(),
			is_published: false,
		});

		return NextResponse.json(
			{ message: "HTML Certificate saved successfully." },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error saving HTML certificate:", error);
		return NextResponse.json(
			{ message: "Failed to save HTML certificate." },
			{ status: 500 }
		);
	}
}

// Helper function to generate a unique identifier
function generateUniqueIdentifier() {
	return "CERT-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

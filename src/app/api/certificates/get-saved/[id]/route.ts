import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Certification } from "@/db/schemas/Certification";
import { z } from "zod";
import { getSession } from "@/libs/auth";
import { eq } from "drizzle-orm";

// Define the validation schema for the ID parameter
const IdSchema = z.string().uuid(); // Assumes the ID is a UUID, adjust if needed

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	// Validate the ID
	const parsedId = IdSchema.safeParse(id);
	if (!parsedId.success) {
		console.error("Invalid certificate ID:", id);
		return NextResponse.json(
			{ message: "Invalid certificate ID" },
			{ status: 400 }
		);
	}

	// Retrieve the session
	let session = await getSession(req);

	// For testing: Mock session if null and in development
	if (!session && process.env.NODE_ENV === "development") {
		console.warn("No session found. Using mock session for testing.");
		session = {
			User: {
				id: "0d78a48d-0128-4351-9aa4-394534ae31c6", // Use your own test User ID
				roles: ["superAdmin"], // Adjust roles as needed for testing
			},
		};
	}

	// Enforce authentication in production
	if (!session || !session.User) {
		console.error("Unauthorized access attempt");
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	// Extract User roles
	const userRoles: string[] = session.User.roles || [];
	console.log("User Roles:", userRoles);

	// Define allowed roles
	const allowedRoles = ["superAdmin", "instructor", "admin"];

	// Check if the User has at least one of the allowed roles
	const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
	console.log("Has Access:", hasAccess);

	if (!hasAccess) {
		console.error("Forbidden access by User:", session.User.id);
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		// Fetch the specific certificate from the database by ID
		const certificate = await db
			.select()
			.from(Certification)
			.where(eq(Certification.id, parsedId.data))
			.execute()
			.then((result) => result[0]); // Get the first result, assuming one result for a specific ID

		if (!certificate) {
			console.error("Certificate not found:", id);
			return NextResponse.json(
				{ message: "Certificate not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ certificate }, { status: 200 });
	} catch (error) {
		console.error("Error fetching certificate:", error);
		return NextResponse.json(
			{ message: "Failed to fetch certificate" },
			{ status: 500 }
		);
	}
}

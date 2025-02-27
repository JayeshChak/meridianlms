import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { getSession } from "@/libs/auth";
import { Certification } from "@/db/schemas/Certification";
import { Courses } from "@/db/schemas/Courses";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
	let session = await getSession(req);

	if (!session) {
		console.error("No session found");
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	console.log("Session:", session); // Log session details

	const userRoles: string[] = Array.isArray(session.User.roles)
		? session.User.roles
		: [session.User.roles];
	console.log("User Roles:", userRoles);

	const allowedRoles = ["superAdmin", "instructor", "admin"];
	const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

	console.log("Has Access:", hasAccess);
	if (!hasAccess) {
		console.error("Forbidden access by User:", session.User.id);
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		const certificates = await db
			.select({
				id: Certification.id,
				course_id: Certification.course_id,
				unique_identifier: Certification.unique_identifier,
				owner_id: Certification.owner_id,
				title: Certification.title,
				description: Certification.description,
				is_published: Certification.is_published,
				created_at: Certification.created_at,
				updated_at: Certification.updated_at,
				deleted_at: Certification.deleted_at,
				is_deleted: Certification.is_deleted,
				courseTitle: Courses.title,
			})
			.from(Certification)
			.leftJoin(Courses, eq(Certification.course_id, Courses.id))
			.execute();

		return NextResponse.json(certificates);
	} catch (error) {
		console.error("Error fetching certificates:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch certificates",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Get session
		const session = await getSession(req);
		if (!session?.User) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized - No valid session" },
				{ status: 401 }
			);
		}

		const data = await req.json();
		const { title, description, is_published, Placeholders } = data;

		// Log the incoming data for debugging
		console.log("Updating certificate with data:", {
			id: params.id,
			title,
			description,
			is_published,
			Placeholders,
		});

		// Update the certificate
		let updatedCertificate: {
			id: string;
			title: string;
			description: string | null;
			is_published: boolean;
		}[];
		try {
			updatedCertificate = await db
				.update(Certification)
				.set({
					title,
					description,
					is_published,
					updated_at: new Date().toISOString(),
					metadata: JSON.stringify({ Placeholders }),
				})
				.where(eq(Certification.id, params.id))
				.returning();
		} catch (dbError) {
			console.error("Database update error:", dbError);
			return NextResponse.json(
				{
					success: false,
					error: "Database update failed",
					details:
						dbError instanceof Error
							? dbError.message
							: "Unknown database error",
				},
				{ status: 500 }
			);
		}

		if (!updatedCertificate || updatedCertificate.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Certificate not found" },
				{ status: 404 }
			);
		}

		// Fetch the updated certificate with course information
		type CertificateWithCourse = {
			id: string;
			courseid: string;
			title: string;
			description: string | null;
			is_published: boolean;
			created_at: Date;
			deleted_at: Date | null;
			is_deleted: boolean;
			metadata?: string | null;
			courseTitle: string | null;
			Placeholders?: any[];
		};
		let updatedCertificateWithCourse: CertificateWithCourse[];
		try {
			updatedCertificateWithCourse = await db
				.select({
					id: Certification.id,
					courseid: Certification.course_id,
					title: Certification.title,
					description: Certification.description,
					is_published: Certification.is_published,
					created_at: Certification.created_at,
					deleted_at: Certification.deleted_at,
					is_deleted: Certification.is_deleted,
					metadata: Certification.metadata,
					courseTitle: Courses.title,
				})
				.from(Certification)
				.leftJoin(Courses, eq(Certification.id, Courses.certificate_id))
				.where(eq(Certification.id, params.id))
				.execute();
		} catch (fetchError) {
			console.error("Error fetching updated certificate:", fetchError);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to fetch updated certificate",
					details:
						fetchError instanceof Error
							? fetchError.message
							: "Unknown fetch error",
				},
				{ status: 500 }
			);
		}

		// Parse the metadata to include Placeholders in the response
		const result = updatedCertificateWithCourse[0];
		if (result && result.metadata) {
			try {
				const parsedMetadata = JSON.parse(result.metadata);
				result.Placeholders = parsedMetadata.Placeholders;
				delete result.metadata; // Remove the raw metadata from the response
			} catch (parseError) {
				console.error("Error parsing metadata:", parseError);
				// Continue without parsing metadata
			}
		}

		return NextResponse.json({ success: true, data: result });
	} catch (error) {
		console.error("Error updating certificate:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to update certificate",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

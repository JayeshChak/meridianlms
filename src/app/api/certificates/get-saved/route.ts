import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Certification } from "@/db/schemas/Certification";
import { Placeholders } from "@/db/schemas/Placeholders"; // Import Placeholders table
import { getSession } from "@/libs/auth";
import { eq, and, inArray } from "drizzle-orm";

interface Certification {
	id: string;
	owner_id: string;
	certificate_data_url: string;
	description: string;
	is_published: boolean;
	unique_identifier: string;
	title: string;
	expiration_date: string;
	is_revocable: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	metadata: string | object;
	is_enabled: boolean;
	orientation: string;
	max_download: number;
	is_deleted: boolean;
	course_id: string;
	file_name: string;
}

export async function GET(req: NextRequest) {
	let session = await getSession(req);
	console.log("Session Data:", session);

	if (!session && process.env.NODE_ENV === "development") {
		console.warn("No session found. Using mock session for testing.");
		session = {
			User: {
				id: "0d78a48d-0128-4351-9aa4-394534ae31c6",
				roles: ["superAdmin", "instructor", "admin"],
			},
		};
	}

	if (!session?.User?.id) {
		console.error("Unauthorized access attempt");
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userRoles: string[] = session.User.roles || [];
	console.log("User Roles:", userRoles);

	const allowedRoles = ["superAdmin", "instructor", "admin"];
	const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

	if (!hasAccess) {
		console.error("Forbidden access by User:", session.User.id);
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		// Step 1: Fetch all certificates for the logged-in User
		const userCertificates = await db
			.select()
			.from(Certification)
			.where(
				and(
					eq(Certification.owner_id, session.User.id),
					eq(Certification.is_deleted, false)
				)
			)
			.execute();

		console.log("Fetched Certificates:", userCertificates);

		if (userCertificates.length === 0) {
			console.error("No certificates found for the User.");
		}

		// Step 2: Get all certificate IDs
		const certificateIds: string[] = userCertificates.map(
			(cert: Certification) => cert.id
		);

		// Step 3: Fetch Placeholders where certificate_id is in the list of fetched certificates
		let placeholdersData = [];
		if (certificateIds.length > 0) {
			placeholdersData = await db
				.select()
				.from(Placeholders)
				.where(inArray(Placeholders.certificate_id, certificateIds))
				.execute();
		}

		console.log("Fetched Placeholders:", placeholdersData);

		// Step 4: Group Placeholders by certificate_id
		const placeholdersByCertificate = placeholdersData.reduce(
			(acc: { [key: string]: any[] }, placeholder: any) => {
				if (!acc[placeholder.certificate_id]) {
					acc[placeholder.certificate_id] = [];
				}
				acc[placeholder.certificate_id].push(placeholder);
				return acc;
			},
			{}
		);

		// Step 5: Merge Placeholders with certificates
		const transformedCertificates = userCertificates.map((cert) => ({
			id: cert.id,
			owner_id: cert.owner_id,
			certificate_data_url: cert.certificate_data_url,
			description: cert.description,
			is_published: cert.is_published,
			unique_identifier: cert.unique_identifier,
			title: cert.title,
			expiration_date: cert.expiration_date,
			is_revocable: cert.is_revocable,
			created_at: cert.created_at,
			updated_at: cert.updated_at,
			deleted_at: cert.deleted_at,
			is_enabled: cert.is_enabled,
			orientation: cert.orientation,
			max_download: cert.max_download,
			is_deleted: cert.is_deleted,
			course_id: cert.course_id,
			file_name: cert.file_name,
			metadata:
				typeof cert.metadata === "string"
					? JSON.parse(cert.metadata)
					: cert.metadata || {}, // Ensure metadata is parsed correctly
			Placeholders: placeholdersByCertificate[cert.id] || [], // Attach Placeholders or an empty array
		}));

		return NextResponse.json(
			{ certificates: transformedCertificates },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching certificates:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			error,
		});

		return NextResponse.json(
			{
				message: "Failed to fetch certificates",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// src/app/api/manageCertificates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { getSession } from "@/libs/auth";
import { Certification } from "@/db/schemas/Certification";
import { Courses } from "@/db/schemas/Courses";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Placeholders as placeholdersTable } from "@/db/schemas/Placeholders";

// export async function PUT(
//     req: NextRequest,
//     { params }: { params: { id: string } }
//   ) {
//     try {
//       //?⿡ Authentication Check
//       const session = await getSession(req);
//       if (!session?.User) {
//         return NextResponse.json(
//           { error: "Unauthorized - No valid session" },
//           { status: 401 }
//         );
//       }

//       //?⿢ Extracting Request Data
//       const { Placeholders, ...certificate_data_url } = await req.json(); // ! warning i edited this delete this

//       if (!Array.isArray(Placeholders)) {
//         return NextResponse.json(
//           { error: "Expected Placeholders array in request" },
//           { status: 400 }
//         );
//       }

//       // // ! warning i added this lines below

//       // //?⿣ UUID Validation
//       // const isValidUUID = (uuid) => {
//       //   const uuidRegex =
//       //     /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//       //   return typeof uuid === "string" && uuidRegex.test(uuid);
//       // };

//       // //?⿤ Database Transaction for Certificate Update
//       // await db.transaction(async (trx) => {
//       //   await trx
//       //     .update(Certification)
//       //     .set(certificate_data_url)
//       //     .where(eq(Certification.id, params.id))
//       //     .execute();

//       //   //?⿥ Handling Placeholders Update
//       //   await Promise.all(
//       //     Placeholders.map(async (placeholderZ) => {
//       //       let placeholderId = placeholderZ.id;
//       //       if (!isValidUUID(placeholderId)) placeholderId = uuidv4();

//       //   //?⿦ Insert or Update Placeholders
//       //       await trx
//       //         .insertOrReplace(placeholdersTable)
//       //         .values({
//       //           id: placeholderId,
//       //           key: placeholderZ.key,
//       //           certificate_id: params.id,
//       //           label: placeholderZ.label,
//       //           value: placeholderZ.value,
//       //           x: placeholderZ.x,
//       //           y: placeholderZ.y,
//       //           fontSize: placeholderZ.fontSize,
//       //           is_visible: placeholderZ.is_visible,
//       //           color: placeholderZ.color,
//       //         })
//       //         .onConflictDoUpdate({
//       //           target: placeholdersTable.id,
//       //           set: {
//       //             key: placeholderZ.key,
//       //             label: placeholderZ.label,
//       //             value: placeholderZ.value,
//       //             x: placeholderZ.x,
//       //             y: placeholderZ.y,
//       //             fontSize: placeholderZ.fontSize,
//       //             is_visible: placeholderZ.is_visible,
//       //             color: placeholderZ.color,
//       //           },
//       //         })
//       //         .execute();

//       //     })
//       //   );
//       // });

//       // // Fetch updated certificate with Placeholders and course information
//       // // ! warning i added this lines above

//       const updatedCertificate = await db
//         .update(Certification)
//         .set(certificate_data_url)
//         .where(eq(Certification.id, params.id))
//         .returning()
//         .execute();

//       // Fetch updated certificate with course information
//       const updatedCertificateWithCourse = await db
//         .select({
//           id: Certification.id,
//           title: Certification.title,
//           description: Certification.description,
//           is_published: Certification.is_published,
//           created_at: Certification.created_at,
//           courseTitle: Courses.title,
//           Placeholders: db
//             .select()
//             .from(placeholdersTable)
//             .where(eq(placeholdersTable.id, params.id)), // ! warning i added this line
//         })
//         .from(Certification)
//         .leftJoin(Courses, eq(Certification.id, Courses.certificate_id))
//         .leftJoin(
//           placeholdersTable,
//           eq(Certification.id, placeholdersTable.certification_id)
//         ) // ! warning i added this line
//         .where(eq(Certification.id, params.id))
//         .execute();

//       return NextResponse.json(updatedCertificateWithCourse[0]);
//     } catch (error) {
//       console.error("Error updating certificate:", error);
//       return NextResponse.json(
//         {
//           error: "Failed to update certificate",
//           details: error instanceof Error ? error.message : "Unknown error",
//         },
//         { status: 500 }
//       );
//     }
//   }

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// 1. Check session (auth)
		const session = await getSession(req);
		if (!session?.User) {
			return NextResponse.json(
				{ error: "Unauthorized - No valid session" },
				{ status: 401 }
			);
		}

		// 2. Parse JSON body
		const { placeholderId, x, y } = await req.json();

		// 3. Validate placeholderId as a UUID
		const isValidUUID = (uuid: string) => {
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			return typeof uuid === "string" && uuidRegex.test(uuid);
		};

		if (!isValidUUID(placeholderId)) {
			return NextResponse.json(
				{ error: "Invalid placeholder ID" },
				{ status: 400 }
			);
		}

		// 4. Update Placeholders table: set x, y
		//    (params.id would be your certificate ID if you also want to check it)
		await db
			.update(placeholdersTable)
			.set({ x, y })
			.where(eq(placeholdersTable.id, placeholderId))
			.execute();

		return NextResponse.json({ success: true, placeholderId, x, y });
	} catch (error) {
		console.error("Error updating placeholder position:", error);
		return NextResponse.json(
			{
				error: "Failed to update placeholder position",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// 1️⃣ (Optional) Check if the User is authenticated
		const session = await getSession(req);
		if (!session?.User) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// 2️⃣ Extract the certificate_id from the route params
		const { id: certificate_id } = params;
		console.log("Fetching certificate:", certificate_id);

		// 3️⃣ Fetch the certificate record
		const [certificateRecord] = await db
			.select()
			.from(Certification)
			.where(eq(Certification.id, certificate_id))
			.limit(1);

		if (!certificateRecord) {
			return NextResponse.json(
				{ error: "Certificate not found" },
				{ status: 404 }
			);
		}

		// 4️⃣ Fetch the Placeholders for this certificate
		const placeholdersData = await db
			.select()
			.from(placeholdersTable)
			.where(eq(placeholdersTable.certificate_id, certificate_id));

		// 5️⃣ Combine them into one object
		const responseData = {
			...certificateRecord,
			Placeholders: placeholdersData,
		};

		// 6️⃣ Return the combined data
		return NextResponse.json(responseData, { status: 200 });
	} catch (error) {
		console.error("Error fetching certificate:", error);
		return NextResponse.json(
			{
				error: "Error fetching certificate",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

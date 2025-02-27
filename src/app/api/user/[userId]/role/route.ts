import { NextResponse } from "next/server";
import { db } from "@/db";
import { User } from "@/db/schemas/User";
import { getSession } from "@/libs/auth"; // Ensure correct path to `getSession`
import { eq } from "drizzle-orm";
import { generateUniqueIdentifier } from "@/utils/generateUniqueIdentifier";

// PATCH handler to update User roles via user_id or email
export async function PATCH(
	req: Request,
	{ params }: { params: { user_id?: string } }
) {
	const { user_id } = params;

	// Get the session
	const session = await getSession(req);
	console.log("Session data:", session);

	// Ensure the User is logged in
	if (!session?.User?.id) {
		console.log("Unauthorized access - no session User.");
		return NextResponse.json(
			{ error: "Unauthorized access" },
			{ status: 401 }
		);
	}

	// Ensure the logged-in User has the 'admin' or 'superAdmin' role
	const isAdmin =
		session.User.roles.includes("admin") ||
		session.User.roles.includes("superAdmin");
	console.log("Is Admin or SuperAdmin:", isAdmin);
	if (!isAdmin) {
		console.log("Forbidden access - not an admin or superAdmin.");
		return NextResponse.json(
			{
				error: "Forbidden. Only admins or superAdmins can update roles.",
			},
			{ status: 403 }
		);
	}

	try {
		const { role, email } = await req.json(); // Check if role and email are passed
		console.log("Payload received:", { role, email });

		// Check if the role is provided
		if (!role) {
			console.log("No role provided in the payload.");
			return NextResponse.json(
				{ error: "Role must be provided." },
				{ status: 400 }
			);
		}

		// Validate the provided role
		const validRoles = ["superAdmin", "admin", "instructor", "User"];
		if (!validRoles.includes(role)) {
			console.log("Invalid role provided:", role);
			return NextResponse.json(
				{ error: "Invalid role provided." },
				{ status: 400 }
			);
		}

		let userToUpdate;

		// If user_id is provided, fetch the User by ID
		if (user_id) {
			console.log("Searching for User by user_id:", user_id);
			const existingUser = await db
				.select()
				.from(User)
				.where(eq(User.id, user_id))
				.limit(1);

			if (existingUser.length === 0) {
				console.log("User not found by user_id:", user_id);
				return NextResponse.json(
					{ error: "User not found." },
					{ status: 404 }
				);
			}

			userToUpdate = existingUser[0];
		} else if (email) {
			// If email is provided, fetch the User by email
			const existingUserByEmail = await db
				.select()
				.from(User)
				.where(eq(User.email, email))
				.limit(1);

			if (existingUserByEmail.length === 0) {
				console.log("User with this email not found:", email);
				return NextResponse.json(
					{ error: "User with this email not found." },
					{ status: 404 }
				);
			}

			userToUpdate = existingUserByEmail[0];
		} else {
			return NextResponse.json(
				{ error: "Either user_id or email must be provided." },
				{ status: 400 }
			);
		}

		// Check if the role has changed and update the unique_identifier accordingly
		let newUniqueIdentifier = userToUpdate.unique_identifier;
		if (userToUpdate.roles[0] !== role) {
			newUniqueIdentifier = await generateUniqueIdentifier(role);
		}

		// Update the User's role and unique_identifier
		const updatedUser = await db
			.update(User)
			.set({
				roles: [role], // Update with the provided role
				unique_identifier: newUniqueIdentifier, // Update unique_identifier if role has changed
			})
			.where(eq(User.id, userToUpdate.id))
			.returning();

		return NextResponse.json({
			message: "Role updated successfully.",
			updatedUser: updatedUser[0],
		});
	} catch (error) {
		console.error("Error in request processing:", error);
		return NextResponse.json(
			{ error: "An error occurred while updating the role." },
			{ status: 500 }
		);
	}
}

// // PATCH handler to update User roles via user_id or email
// export async function PATCH(req: Request, { params }: { params: { user_id?: string } }) {
//   const { user_id } = params;

//   // Get the session
//   const session = await getSession(req);
//   console.log("Session data:", session);

//   // Ensure the User is logged in
//   if (!session?.User?.id) {
//     console.log("Unauthorized access - no session User.");
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   // Ensure the logged-in User has the 'admin' or 'superAdmin' role
//   const isAdmin = session.User.roles.includes("admin") || session.User.roles.includes("superAdmin");
//   console.log("Is Admin or SuperAdmin:", isAdmin);
//   if (!isAdmin) {
//     console.log("Forbidden access - not an admin or superAdmin.");
//     return NextResponse.json({ error: "Forbidden. Only admins or superAdmins can update roles." }, { status: 403 });
//   }

//   try {
//     const { role, email } = await req.json(); // Check if role and email are passed
//     console.log("Payload received:", { role, email });

//     // Check if the role is provided
//     if (!role) {
//       console.log("No role provided in the payload.");
//       return NextResponse.json({ error: "Role must be provided." }, { status: 400 });
//     }

//     // Validate the provided role
//     const validRoles = ["superAdmin", "admin", "instructor", "User"];
//     if (!validRoles.includes(role)) {
//       console.log("Invalid role provided:", role);
//       return NextResponse.json({ error: "Invalid role provided." }, { status: 400 });
//     }

//     let userToUpdate;

//     // If user_id is provided, fetch the User by ID
//     if (user_id) {
//       console.log("Searching for User by user_id:", user_id);
//       const existingUser = await db.select().from(User).where(eq(User.id, user_id)).limit(1);
//       console.log("Existing User by ID:", existingUser);

//       if (existingUser.length === 0) {
//         console.log("User not found by user_id:", user_id);
//         return NextResponse.json({ error: "User not found." }, { status: 404 });
//       }

//       userToUpdate = existingUser[0];
//     } else if (email) {
//       // If email is provided, fetch the User by email
//       console.log("Searching for User by email:", email);
//       const existingUserByEmail = await db.select().from(User).where(eq(User.email, email)).limit(1);
//       console.log("Existing User by email:", existingUserByEmail);

//       if (existingUserByEmail.length === 0) {
//         console.log("User with this email not found:", email);
//         return NextResponse.json({ error: "User with this email not found." }, { status: 404 });
//       }

//       userToUpdate = existingUserByEmail[0];
//     } else {
//       console.log("Neither user_id nor email provided.");
//       return NextResponse.json({ error: "Either user_id or email must be provided." }, { status: 400 });
//     }

//     // Log the User to be updated
//     console.log("User to update:", userToUpdate);

//     // Update the User's role
//     try {
//       const updatedUser = await db
//         .update(User)
//         .set({
//           roles: [role], // Update with the provided role
//         })
//         .where(eq(User.id, userToUpdate.id))
//         .returning();

//       console.log("Updated User:", updatedUser);

//       return NextResponse.json({ message: "Role updated successfully.", updatedUser: updatedUser[0] });
//     } catch (dbError) {
//       console.error("Database error updating User role:", dbError);
//       return NextResponse.json({ error: "Failed to update role in the database." }, { status: 500 });
//     }
//   } catch (error) {
//     console.error("Error in request processing:", error);
//     return NextResponse.json({ error: "An error occurred while updating the role." }, { status: 500 });
//   }
// }

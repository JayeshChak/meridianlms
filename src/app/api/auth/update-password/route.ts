import { NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { User } from "@/db/schemas/User";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
	// Get the current session
	const session = await getSession(req);

	console.log("session", session);

	if (!session || !session.User) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { currentPassword, newPassword } = await req.json();
	const user_id = session.User.id;

	// Fetch the User's current password hash from the database
	const existingUser = await db
		.select()
		.from(User)
		.where(eq(User.id, user_id))
		.limit(1)
		.then((rows) => rows[0]);

	if (!existingUser) {
		return NextResponse.json({ error: "User not found." }, { status: 404 });
	}

	// Verify the current password
	const isPasswordCorrect = await bcrypt.compare(
		currentPassword,
		existingUser.password
	);
	if (!isPasswordCorrect) {
		return NextResponse.json(
			{ error: "Incorrect current password." },
			{ status: 400 }
		);
	}

	// Verify User not enter same or current password
	if (currentPassword === newPassword) {
		return NextResponse.json(
			{
				error: "New password cannot be the same as the current password.",
			},
			{ status: 400 }
		);
	}

	// Hash the new password
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	// Update the User's password in the database
	await db
		.update(User)
		.set({ password: hashedPassword })
		.where(eq(User.id, user_id));

	return NextResponse.json({ message: "Password updated successfully." });
}

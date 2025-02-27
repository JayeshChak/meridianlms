import { NextResponse } from "next/server";
import { db } from "../../../../db/index";
import { User } from "../../../../db/schemas/User";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/libs/emial/emailService"; // Adjust path as needed
import { BASE_URL_API } from "@/actions/constant";

export async function POST(req) {
	try {
		const { token } = await req.json();

		if (!token) {
			return NextResponse.json(
				{ message: "Invalid token" },
				{ status: 400 }
			);
		}

		// Find the User by activation token
		const foundUser = await db
			.select()
			.from(User)
			.where(eq(User.activation_token, token))
			.then((res) => res[0]);

		if (!foundUser) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		if (foundUser.is_verified) {
			return NextResponse.json(
				{ message: "Account already verified" },
				{ status: 400 }
			);
		}

		// Resend the activation email
		await sendEmail({
			to: foundUser.email,
			subject: "Activate Your Account",
			text: "Please activate your account.",
			templateName: "activationEmailTemplate",
			templateData: {
				name: foundUser.username,
				activationLink: `${BASE_URL_API}/auth/activate?token=${token}`,
			},
		});

		return NextResponse.json(
			{ message: "Activation link resent" },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Error", error: error.message },
			{ status: 500 }
		);
	}
}

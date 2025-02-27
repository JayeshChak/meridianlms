import { NextResponse } from "next/server";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import { db } from "../../../../db/index";
import { User } from "../../../../db/schemas/User";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/libs/emial/emailService"; // Adjust this path to the actual location of your email servic
import { BASE_URL } from "@/actions/constant";
import { generateUniqueIdentifier } from "@/utils/generateUniqueIdentifier"; // Create this utility function

function generateNameFromUsername(username: string): string {
	const parts = username.split(" ");
	if (parts.length >= 2) {
		return `${parts[0]} ${parts[1]}`;
	}
	return username;
}

// POST handler for User registration
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const userData = body;

		// Check for required fields
		if (!userData?.email || !userData?.password || !userData?.username) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Check for duplicate email
		const duplicateEmail = await db
			.select()
			.from(User)
			.where(eq(User.email, userData.email))
			.then((res) => res);

		// Check for duplicate username
		const duplicateUsername = await db
			.select()
			.from(User)
			.where(eq(User.username, userData.username))
			.then((res) => res);

		if (duplicateEmail.length > 0 || duplicateUsername.length > 0) {
			return NextResponse.json(
				{ message: "Duplicate Email or Username" },
				{ status: 409 }
			);
		}

		// Hash the password
		const hashPassword = await bcrypt.hash(userData.password, 10);

		// Generate activation token
		const activation_token = uuidv4();

		// Generate unique identifier
		const unique_identifier = await generateUniqueIdentifier("User"); // Use the appropriate role if needed

		// Create the User
		const newUser = await db
			.insert(User)
			.values({
				unique_identifier, // Assign the unique identifier
				email: userData.email,
				phone: userData.phone,
				password: hashPassword, // Save the hashed password
				username: userData.username,
				name: generateNameFromUsername(userData.username).trim(),
				image: userData.image,
				roles: sql`'["User"]'::json`, // Assign default role as 'User'
				is_verified: false, // Assuming the User is not verified at creation
				activation_token, // Store the activation token
			})
			.returning()
			.then((res) => res);

		// Send activation email using the centralized sendEmail function
		await sendEmail({
			to: userData.email,
			subject: "Activate Your Account",
			text: "Please activate your account.",
			templateName: "activationEmailTemplate",
			templateData: {
				name: userData.username,
				activationLink: `${BASE_URL}/pass/activate?token=${activation_token}`,
			},
		});

		return NextResponse.json(
			{
				message:
					"User created. Please check your email to activate your account.",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Error", error: error.message },
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { UserSocials } from "@/db/schemas/UserSocials";
import { eq } from "drizzle-orm";
import { getSession } from "@/libs/auth"; // Ensure this path is correct

export async function POST(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	// Get the current session
	const session = await getSession(req);

	// Verify if the User is logged in
	if (!session || !session.User) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get the user_id from the session
	const sessionUserId = session.User.id;

	// Check if the session user_id matches the user_id in the route parameter
	if (sessionUserId !== params.user_id) {
		return NextResponse.json(
			{
				error: "Forbidden: You are not allowed to update this User's social links.",
			},
			{ status: 403 }
		);
	}

	// Extract the social media details from the request body
	const body = await req.json();
	const { facebook, twitter, linkedin, website, github } = body;

	// Validate the user_id in the route parameter
	if (!params.user_id) {
		return NextResponse.json(
			{ error: "User ID is required." },
			{ status: 400 }
		);
	}

	try {
		// Check if social links already exist for the User
		const existingSocials = await db
			.select()
			.from(UserSocials)
			.where(eq(UserSocials.user_id, params.user_id))
			.limit(1)
			.then((rows) => rows[0]);

		if (existingSocials) {
			// Update existing social links
			await db
				.update(UserSocials)
				.set({
					facebook: facebook || existingSocials.facebook,
					twitter: twitter || existingSocials.twitter,
					linkedin: linkedin || existingSocials.linkedin,
					website: website || existingSocials.website,
					github: github || existingSocials.github,
				})
				.where(eq(UserSocials.user_id, params.user_id));
		} else {
			// Insert new social links
			await db.insert(UserSocials).values({
				user_id: params.user_id,
				facebook,
				twitter,
				linkedin,
				website,
				github,
			});
		}

		return NextResponse.json({
			message: "Social links updated successfully.",
		});
	} catch (error) {
		console.error("Error updating social links:", error);
		return NextResponse.json(
			{ error: "An error occurred while updating social links." },
			{ status: 500 }
		);
	}
}

// GET handler for retrieving social links
export async function GET(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	// Get the current session
	const session = await getSession(req);

	// Verify if the User is logged in
	if (!session || !session.User) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Check if the session user_id matches the user_id in the route parameter
	const sessionUserId = session.User.id;
	if (sessionUserId !== params.user_id) {
		return NextResponse.json(
			{
				error: "Forbidden: You are not allowed to view this User's social links.",
			},
			{ status: 403 }
		);
	}

	try {
		// Fetch the User's social links from the database
		const socialLinks = await db
			.select()
			.from(UserSocials)
			.where(eq(UserSocials.user_id, params.user_id))
			.limit(1)
			.then((rows) => rows[0]);

		// Return 404 if social links do not exist for the User
		if (!socialLinks) {
			return NextResponse.json(
				{ error: "Social links not found." },
				{ status: 404 }
			);
		}

		// Return the User's social links
		return NextResponse.json(socialLinks, { status: 200 });
	} catch (error) {
		console.error("Error fetching social links:", error);
		return NextResponse.json(
			{ error: "An error occurred while fetching social links." },
			{ status: 500 }
		);
	}
}

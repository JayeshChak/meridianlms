// src/app/api/Courses/[id]/instructor/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Assuming db is your Drizzle ORM instance
import { Courses } from "@/db/schemas/Courses"; // Import course schema
import { User } from "@/db/schemas/User"; // Import User schema
import { UserSocials } from "@/db/schemas/UserSocials"; // Import UserSocials schema
import { eq } from "drizzle-orm"; // For building conditions

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const course_id = params.id;

	try {
		// Fetch the course, instructor, and instructor's social media details based on course ID
		const result = await db
			.select({
				course: {
					id: Courses.id,
					title: Courses.title,
					description: Courses.description,
					price: Courses.price,
					demo_video_url: Courses.demo_video_url,
					is_published: Courses.is_published,
					enrolled_count: Courses.enrolled_count,
				},
				instructor: {
					id: User.id,
					name: User.name,
					email: User.email,
					image: User.image,
					roles: User.roles,
				},
				socials: {
					facebook: UserSocials.facebook,
					twitter: UserSocials.twitter,
					linkedin: UserSocials.linkedin,
					website: UserSocials.website,
					github: UserSocials.github,
				},
			})
			.from(Courses)
			.leftJoin(User, eq(Courses.user_id, User.id)) // Join Courses with users table by user_id
			.leftJoin(UserSocials, eq(UserSocials.user_id, User.id)) // Join users with UserSocials table by user_id
			.where(eq(Courses.id, course_id)); // Filter by course ID

		if (!result || result.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: `No course found with ID: ${course_id}`,
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: result[0],
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching course, instructor, and socials",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

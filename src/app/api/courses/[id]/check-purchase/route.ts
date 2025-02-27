import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { User } from "@/db/schemas/User";
import { eq } from "drizzle-orm";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession(req);
		if (!session?.User) {
			return NextResponse.json({ hasPurchased: false }, { status: 401 });
		}

		const course_id = params.id;
		console.log("Checking purchase for course_id:", course_id);

		// Fetch User's roles and enrolled Courses
		const [userData] = await db
			.select({
				roles: User.roles,
				enrolled_courses: User.enrolled_courses,
			})
			.from(User)
			.where(eq(User.id, session.User.id));

		console.log("User enrolled Courses:", userData?.enrolled_courses);

		// Allow superAdmin and admin to access the certificate, but not all users
		if (
			userData?.roles?.some((role) =>
				["superAdmin", "admin"].includes(role)
			)
		) {
			return NextResponse.json({ hasPurchased: true });
		}

		// Ensure `enrolled_courses` exists and is an array
		if (
			!Array.isArray(userData?.enrolled_courses) ||
			userData.enrolled_courses.length === 0
		) {
			console.log("No enrolled Courses found");
			return NextResponse.json({ hasPurchased: false });
		}

		// Check if User has purchased this specific course
		const hasPurchased = userData.enrolled_courses.some(
			(course: { id: string }) => course.id === course_id
		);

		console.log("Purchase check result:", hasPurchased);

		return NextResponse.json({ hasPurchased });
	} catch (error) {
		console.error("Error checking enrollment:", error);
		return NextResponse.json(
			{ error: "Failed to check course enrollment" },
			{ status: 500 }
		);
	}
}

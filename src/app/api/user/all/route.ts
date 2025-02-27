import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth"; // Your custom getSession import
import { db } from "@/db"; // Assuming your database connection is set up here
import { User } from "@/db/schemas/User"; // Assuming you have the User schema defined in Drizzle

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// GET handler to fetch all users (admin only)
export async function GET(req: NextRequest) {
	try {
		// Get session from your custom auth configuration
		const session = await getSession(req);

		// Check if the User is authenticated
		if (!session || !session.User) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if the User has the 'admin' role
		const isAdmin =
			session.User.roles && session.User.roles.includes("admin");
		if (!isAdmin) {
			return NextResponse.json(
				{ message: "Forbidden: Admins only" },
				{ status: 403 }
			);
		}

		// Fetch all users from the database
		const allUsers = await db
			.select({
				id: User.id,
				unique_identifier: User.unique_identifier,
				name: User.name,
				username: User.username,
				email: User.email,
				phone: User.phone,
				image: User.image,
				roles: User.roles,
				is_verified: User.is_verified,
				created_at: User.created_at,
				updated_at: User.updated_at,
				enrolled_courses: User.enrolled_courses,
			})
			.from(User);

		// If no users found, return a 404 response
		if (!allUsers || allUsers.length === 0) {
			return NextResponse.json(
				{ message: "No users found." },
				{ status: 404 }
			);
		}

		// Modify users to include only the count of enrolled Courses
		const usersWithEnrolledCoursesCount = allUsers.map((userData) => ({
			id: userData.id,
			name: userData.name,
			username: userData.username,
			unique_identifier: userData.unique_identifier,
			email: userData.email,
			phone: userData.phone,
			image: userData.image,
			roles: userData.roles,
			is_verified: userData.is_verified,
			created_at: userData.created_at,
			updated_at: userData.updated_at,
			enrolledCoursesCount: userData.enrolled_courses
				? userData.enrolled_courses.length
				: 0, // Add only the count
		}));

		// Return all users with the count of enrolled Courses
		return NextResponse.json(usersWithEnrolledCoursesCount, {
			status: 200,
		});
	} catch (error) {
		console.error("Error fetching all users with Courses:", error);
		return NextResponse.json(
			{ error: "An error occurred while fetching all users." },
			{ status: 500 }
		);
	}
}

// import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from '@/libs/auth'; // Your custom getSession import
// import { db } from '@/db'; // Assuming your database connection is set up here
// import { User } from '@/db/schemas/User'; // Assuming you have the User schema defined in Drizzle

// // GET handler to fetch all users (admin only)
// export async function GET(req: NextRequest) {
//   try {
//     // Get session from your custom auth configuration
//     const session = await getSession(req);

//     // Check if the User is authenticated
//     if (!session || !session.User) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     // Check if the User has the 'admin' role
//     const isAdmin = session.User.roles && session.User.roles.includes('admin');
//     if (!isAdmin) {
//       return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
//     }

//     // Fetch all users from the database
//     const allUsers = await db
//       .select({
//         id: User.id,
//         name: User.name,
//         username: User.username,
//         email: User.email,
//         phone: User.phone,
//         image: User.image,
//         roles: User.roles,
//         is_verified: User.is_verified,
//         created_at: User.created_at,
//         updated_at: User.updated_at,
//         enrolled_courses: User.enrolled_courses,
//       })
//       .from(User);

//     // If no users found, return a 404 response
//     if (!allUsers || allUsers.length === 0) {
//       return NextResponse.json({ message: 'No users found.' }, { status: 404 });
//     }

//     // Modify users to include only the count of enrolled Courses
//     const usersWithEnrolledCoursesCount = allUsers.map((userData) => ({
//       id: userData.id,
//       name: userData.name,
//       username: userData.username,
//       email: userData.email,
//       phone: userData.phone,
//       image: userData.image,
//       roles: userData.roles,
//       is_verified: userData.is_verified,
//       created_at: userData.created_at,
//       updated_at: userData.updated_at,
//       enrolledCoursesCount: userData.enrolled_courses ? userData.enrolled_courses.length : 0, // Add only the count
//     }));

//     // Return all users with the count of enrolled Courses
//     return NextResponse.json(usersWithEnrolledCoursesCount, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching all users with Courses:', error);
//     return NextResponse.json({ error: 'An error occurred while fetching all users.' }, { status: 500 });
//   }
// }

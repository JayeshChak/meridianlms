import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getSession } from "@/libs/auth"; // Ensure this path is correct
import { User } from "@/db/schemas/User"; // Assuming you have the User schema defined in Drizzle
import { eq, and, not, desc } from "drizzle-orm";
import { db } from "@/db";
import { UserDetails } from "@/db/schemas/UserDetails";

export async function PATCH(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	const { user_id } = params;

	if (!user_id) {
		return NextResponse.json(
			{ error: "User ID is required." },
			{ status: 400 }
		);
	}

	try {
		const newData = await req.json();
		const fullName = `${newData.firstName?.trim() || ""} ${
			newData.lastName?.trim() || ""
		}`.trim();

		// Check for existing User
		const existingUser = await db
			.select()
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1);

		if (existingUser.length === 0) {
			return NextResponse.json(
				{ message: "User does not exist" },
				{ status: 404 }
			);
		}

		// Update User data
		const updateUser = await db
			.update(User)
			.set({
				name: fullName || existingUser[0].name,
				username: newData.username || existingUser[0].username,
				phone: newData.phoneNumber || existingUser[0].phone,
				email: existingUser[0].email,
			})
			.where(eq(User.id, user_id))
			.returning();

		// Update or insert User details
		const existingDetails = await db
			.select()
			.from(UserDetails)
			.where(eq(UserDetails.user_id, user_id))
			.limit(1);

		if (existingDetails.length > 0) {
			await db
				.update(UserDetails)
				.set({
					biography: newData.bio || existingDetails[0].biography,
					expertise: newData.skills || existingDetails[0].expertise,
				})
				.where(eq(UserDetails.user_id, user_id));
		} else {
			await db.insert(UserDetails).values({
				user_id: user_id,
				biography: newData.bio || "Biography not provided.",
				expertise: newData.skills || [],
			});
		}

		return NextResponse.json({
			message: "User details updated successfully.",
			updatedUser: updateUser[0],
		});
	} catch (error) {
		console.error("Error updating User details:", error);
		return NextResponse.json(
			{ error: "An error occurred while updating User details." },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const session = await getSession(req);
		const user_id = session?.User?.id;

		if (!user_id) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Ensure the logged-in User has the 'admin' or 'superAdmin' role
		const currentUser = await db
			.select({
				roles: User.roles,
			})
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1)
			.then((res) => res[0]);

		if (!currentUser) {
			return NextResponse.json(
				{ message: "User not found." },
				{ status: 404 }
			);
		}

		const isAdmin =
			currentUser.roles.includes("admin") ||
			currentUser.roles.includes("superAdmin");

		if (!isAdmin) {
			return NextResponse.json(
				{ message: "Forbidden. Only admins can access this resource." },
				{ status: 403 }
			);
		}

		// Optional: Implement pagination, sorting, and filtering
		// For simplicity, we'll fetch all users here

		const allUsers = await db
			.select({
				id: User.id,
				name: User.name,
				username: User.username,
				phone: User.phone,
				email: User.email,
				image: User.image,
				unique_identifier: User.unique_identifier,
				roles: User.roles,
				enrolledCoursesCount: db.raw(
					`(SELECT COUNT(*) FROM enrolled_courses WHERE enrolled_courses.user_id = User.id)`
				),
				wishlistCount: db.raw(
					`(SELECT COUNT(*) FROM wishlist WHERE wishlist.user_id = User.id)`
				),
				is_verified: User.is_verified,
				created_at: User.created_at,
				updated_at: User.updated_at,
			})
			.from(User)
			.orderBy(desc(User.created_at))
			.then((res) => res);

		// console.log("allUsers",allUsers)

		return NextResponse.json(allUsers, { status: 200 });
	} catch (error: any) {
		console.error("[FETCH_ALL_USERS]", error);
		return NextResponse.json(
			{ message: error.message || "Internal Error" },
			{ status: 500 }
		);
	}
}

// export async function GET(req: Request) {
//   try {
//     const session = await getSession(req);
//     const user_id = session?.User?.id;

//     if (!user_id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Parse query parameters from the URL
//     const url = new URL(req.url);
//     const onlyWishlist = url.searchParams.get("onlyWishlist") === "true";
//     const onlyEnrolledCourses = url.searchParams.get("onlyEnrolledCourses") === "true";

//     // Fetch the full User details
//     const userInfo = await db
//       .select({
//         id: User.id,
//         name: User.name,
//         username: User.username,
//         phone: User.phone,
//         email: User.email,
//         image: User.image,
//         roles: User.roles,
//         enrolled_courses: User.enrolled_courses,
//         wishlist: User.wishlist,
//         is_verified: User.is_verified,
//         created_at: User.created_at,
//         updated_at: User.updated_at,
//       })
//       .from(User)
//       .where(eq(User.id, user_id))
//       .limit(1)
//       .then((res) => res[0]);

//     if (!userInfo) {
//       return NextResponse.json({ message: "User not found." }, { status: 404 });
//     }

//     // Filter the response based on the query parameters
//     if (onlyWishlist) {
//       return NextResponse.json({
//         wishlist: userInfo.wishlist || [],
//       });
//     }

//     if (onlyEnrolledCourses) {
//       return NextResponse.json({
//         enrolled_courses: userInfo.enrolled_courses || [],
//       });
//     }

//     // Return the full User information by default
//     return NextResponse.json(userInfo);
//   } catch (error) {
//     console.log("[USER_INFO]", error);
//     return NextResponse.json({ message: "Internal Error" }, { status: 500 });
//   }
// }

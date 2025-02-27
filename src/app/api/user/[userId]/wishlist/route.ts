import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Your Drizzle ORM instance
import { User } from "@/db/schemas/User"; // Your User schema
import { Courses } from "@/db/schemas/Courses"; // Your Courses schema
import { eq, inArray } from "drizzle-orm"; // For handling array-based queries

// GET wishlist based on user_id
export async function GET(
	req: NextRequest,
	{ params }: { params: { user_id: string } }
) {
	const user_id = params.user_id;

	try {
		// Fetch the User's wishlist from the User table
		const userWithWishlist = await db
			.select({
				wishlist: User.wishlist,
			})
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1);

		// If the User or wishlist is not found, return an error
		if (!userWithWishlist || userWithWishlist.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: `User with ID ${user_id} not found or has no wishlist`,
				},
				{ status: 404 }
			);
		}

		const { wishlist } = userWithWishlist[0];

		// If the wishlist is empty, return an empty array
		if (!wishlist || wishlist.length === 0) {
			return NextResponse.json({
				success: true,
				data: [],
				message: "Wishlist is empty",
			});
		}

		// Fetch course details for each course_id in the wishlist
		const wishlistCourses = await db
			.select({
				id: Courses.id,
				title: Courses.title,
				lesson: Courses.lesson,
				duration: Courses.duration,
				thumbnail: Courses.thumbnail,
				price: Courses.price,
				estimated_price: Courses.estimated_price,
				is_free: Courses.is_free,
				Categories: Courses.Categories,
				instructor_name: Courses.instructor_name,
				enrolled_count: Courses.enrolled_count,
			})
			.from(Courses)
			.where(inArray(Courses.id, wishlist));

		// Return the fetched wishlist Courses
		return NextResponse.json({
			success: true,
			data: wishlistCourses,
		});
	} catch (error) {
		console.error("Error fetching wishlist:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching wishlist",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

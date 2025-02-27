import { NextResponse } from "next/server";
import { db } from "@/db";
import { Cart } from "@/db/schemas/Cart";
import { Courses } from "@/db/schemas/Courses";
import { and, eq } from "drizzle-orm";

// POST /api/User/[user_id]/Cart
export async function POST(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	const { user_id } = params;
	const { course_id } = await req.json();

	// Validate that both user_id and course_id are provided
	if (!user_id || !course_id) {
		return NextResponse.json(
			{ error: "User ID and Course ID are required." },
			{ status: 400 }
		);
	}

	try {
		// Check if the course exists in the database
		const courseExists = await db
			.select()
			.from(Courses)
			.where(eq(Courses.id, course_id))
			.limit(1);

		if (courseExists.length === 0) {
			return NextResponse.json(
				{ error: `Course with ID '${course_id}' does not exist.` },
				{ status: 404 }
			);
		}

		// Check if the course is already in the User's Cart
		const existingCartItem = await db
			.select()
			.from(Cart)
			.where(
				and(eq(Cart.user_id, user_id), eq(Cart.course_id, course_id))
			) // Correctly chain conditions
			.limit(1);

		if (existingCartItem.length > 0) {
			return NextResponse.json(
				{ message: "Course already in Cart." },
				{ status: 409 }
			);
		}

		// Add the course to the User's Cart
		await db.insert(Cart).values({
			user_id,
			course_id,
			created_at: new Date(), // Add the created_at timestamp
		});

		return NextResponse.json(
			{ message: "Course added to Cart." },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error adding course to Cart:", error);
		return NextResponse.json(
			{ error: "An error occurred while adding the course to the Cart." },
			{ status: 500 }
		);
	}
}

// export async function GET(req: Request, { params }: { params: { user_id: string } }) {
//   const { user_id } = params;

//   // Validate that user_id is provided
//   if (!user_id) {
//     return NextResponse.json(
//       { error: "User ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Fetch all Cart items for the User
//     const cartItems = await db
//       .select({
//         cartId: Cart.id,
//         course_id: Cart.course_id,
//         title: Courses.title,
//         price: Courses.price,
//         estimated_price: Courses.estimated_price,
//         is_free: Courses.is_free,
//         instructor_name: Courses.instructor_name,
//         thumbnail: Courses.thumbnail
//       })
//       .from(Cart)
//       .leftJoin(Courses, eq(Cart.course_id, Courses.id))
//       .where(eq(Cart.user_id, user_id));

//     if (cartItems.length === 0) {
//       return NextResponse.json({ message: "No items in the Cart." }, { status: 404 });
//     }

//     // Calculate discount and modify cartItems with discount information
//     const cartItemsWithDiscount = cartItems.map(item => {
//       const price = parseFloat(item.price);
//       const estimated_price = parseFloat(item.estimated_price);

//       // Calculate discount percentage if applicable
//       let discount = 0;
//       if (estimated_price > price) {
//         discount = ((estimated_price - price) / estimated_price) * 100;
//       }

//       return {
//         ...item,
//         discount: discount.toFixed(2), // Add discount field (rounded to 2 decimal places)
//       };
//     });

//     // Return the Cart items with discount information
//     return NextResponse.json(cartItemsWithDiscount, { status: 200 });

//   } catch (error) {
//     console.error("Error fetching Cart items:", error);
//     return NextResponse.json(
//       { error: "An error occurred while fetching Cart items." },
//       { status: 500 }
//     );
//   }
// }

// PATCH /api/User/[user_id]/Cart
export async function PATCH(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	const { user_id } = params;
	const { addCourses, removeCourses } = await req.json();

	if (!user_id) {
		return NextResponse.json(
			{ error: "User ID is required." },
			{ status: 400 }
		);
	}

	// Add Courses to the Cart
	if (addCourses && Array.isArray(addCourses)) {
		for (const course_id of addCourses) {
			const courseExists = await db
				.select()
				.from(Courses)
				.where({ id: course_id })
				.limit(1);
			if (courseExists.length > 0) {
				await db.insert(Cart).values({ user_id, course_id });
			}
		}
	}

	// Remove Courses from the Cart
	if (removeCourses && Array.isArray(removeCourses)) {
		await db.delete(Cart).where({
			user_id,
			course_id: { in: removeCourses },
		});
	}

	return NextResponse.json({ message: "Cart updated successfully." });
}

// DELETE /api/User/[user_id]/Cart?course_id=COURSE_ID

export async function GET(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	const { user_id } = params;

	// Validate that user_id is provided
	if (!user_id) {
		return NextResponse.json(
			{ error: "User ID is required." },
			{ status: 400 }
		);
	}

	try {
		// Fetch all Cart items for the User
		const cartItems = await db
			.select({
				cartId: Cart.id,
				course_id: Cart.course_id,
				title: Courses.title,
				price: Courses.price,
				estimated_price: Courses.estimated_price,
				is_free: Courses.is_free,
				instructor_name: Courses.instructor_name,
				thumbnail: Courses.thumbnail,
			})
			.from(Cart)
			.leftJoin(Courses, eq(Cart.course_id, Courses.id))
			.where(eq(Cart.user_id, user_id));

		if (cartItems.length === 0) {
			return NextResponse.json([], { status: 200 }); // Return empty array if no items are in the Cart
		}

		// Calculate discount and modify cartItems with discount information
		const cartItemsWithDiscount = cartItems.map((item) => {
			const price = parseFloat(item.price) || 0; // Ensure price is a valid number
			const estimated_price = parseFloat(item.estimated_price) || 0; // Ensure estimated_price is a valid number

			// Calculate discount percentage if applicable
			let discount = 0;
			if (estimated_price > price) {
				discount = ((estimated_price - price) / estimated_price) * 100;
			}

			return {
				...item,
				discount: discount.toFixed(2), // Add discount field (rounded to 2 decimal places)
			};
		});

		// Return the Cart items with discount information
		return NextResponse.json(cartItemsWithDiscount, { status: 200 });
	} catch (error) {
		console.error("Error fetching Cart items:", error.message || error);
		return NextResponse.json(
			{ error: "An error occurred while fetching Cart items." },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { user_id: string } }
) {
	const { searchParams } = new URL(req.url);
	const cartId = searchParams.get("cartId");
	const user_id = params.user_id;

	try {
		if (cartId) {
			// Delete the Cart item based on cartId
			const deleteResult = await db
				.delete(Cart)
				.where(eq(Cart.id, cartId));

			// Check if any rows were affected (i.e., Cart item removed)
			if (deleteResult.rowCount === 0) {
				return NextResponse.json(
					{ error: "Cart item not found." },
					{ status: 404 }
				);
			}

			return NextResponse.json(
				{ message: "Cart item removed successfully." },
				{ status: 200 }
			);
		} else {
			// No cartId provided, delete all Cart items for the User
			const deleteResult = await db
				.delete(Cart)
				.where(eq(Cart.user_id, user_id));

			// Check if any rows were affected
			if (deleteResult.rowCount === 0) {
				return NextResponse.json(
					{ error: "No Cart items found for this User." },
					{ status: 404 }
				);
			}

			return NextResponse.json(
				{ message: "All Cart items removed successfully." },
				{ status: 200 }
			);
		}
	} catch (error) {
		console.error("Error removing Cart item(s):", error);
		return NextResponse.json(
			{ error: "An error occurred while removing the Cart item(s)." },
			{ status: 500 }
		);
	}
}

// export async function DELETE(req: Request, { params }: { params: { user_id: string } }) {
//   const { searchParams } = new URL(req.url);
//   const cartId = searchParams.get("cartId");

//   // Validate that cartId is provided
//   if (!cartId) {
//     return NextResponse.json(
//       { error: "Cart ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Delete the Cart item based on cartId
//     const deleteResult = await db
//       .delete(Cart)
//       .where(eq(Cart.id, cartId));

//     // Check if any rows were affected (i.e., Cart item removed)
//     if (deleteResult.rowCount === 0) {
//       return NextResponse.json(
//         { error: "Cart item not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Cart item removed successfully." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error removing Cart item:", error);
//     return NextResponse.json(
//       { error: "An error occurred while removing the Cart item." },
//       { status: 500 }
//     );
//   }
// }

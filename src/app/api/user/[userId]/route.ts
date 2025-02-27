// src/app/api/User/[user_id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { User } from "@/db/schemas/User";
import { UserDetails } from "@/db/schemas/UserDetails";
import { UserSocials } from "@/db/schemas/UserSocials";
import { eq } from "drizzle-orm";

export async function PUT(
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
		const body = await req.json();

		// Handle update of basic User details, roles, and enrolled_courses
		const updateData = {
			name: body.name !== undefined ? body.name : undefined,
			username: body.username !== undefined ? body.username : undefined,
			phone: body.phone !== undefined ? body.phone : undefined,
			email: body.email !== undefined ? body.email : undefined,
			image: body.image !== undefined ? body.image : undefined,
			roles: body.roles !== undefined ? body.roles : undefined, // Handle roles
			enrolled_courses:
				body.enrolled_courses !== undefined
					? body.enrolled_courses
					: undefined, // Handle enrolled_courses
			is_verified:
				body.is_verified !== undefined ? body.is_verified : undefined,
			wishlist: body.wishlist !== undefined ? body.wishlist : undefined,
		};

		// Filter out undefined fields from updateData to prevent overwriting with undefined
		const filteredUpdateData = Object.fromEntries(
			Object.entries(updateData).filter(([_, v]) => v !== undefined)
		);

		const updatedUser = await db
			.update(User)
			.set(filteredUpdateData)
			.where(eq(User.id, user_id))
			.returning();

		// If there's additional data for UserDetails, update or insert it
		let updatedUserDetails = null;
		if (body.biography !== undefined || body.expertise !== undefined) {
			const existingDetails = await db
				.select()
				.from(UserDetails)
				.where(eq(UserDetails.user_id, user_id))
				.limit(1);

			if (existingDetails.length > 0) {
				updatedUserDetails = await db
					.update(UserDetails)
					.set({
						biography:
							body.biography !== undefined
								? body.biography
								: existingDetails[0].biography,
						expertise:
							body.expertise !== undefined
								? body.expertise
								: existingDetails[0].expertise,
					})
					.where(eq(UserDetails.user_id, user_id))
					.returning();
			} else {
				updatedUserDetails = await db
					.insert(UserDetails)
					.values({
						user_id: user_id,
						biography: body.biography || "Biography not provided.",
						expertise: body.expertise || [],
					})
					.returning();
			}
		}

		// Combine User and UserDetails data for response
		const responseData = {
			message: "User details updated successfully.",
			updatedUser: updatedUser,
			updatedUserDetails: updatedUserDetails ? updatedUserDetails : [],
		};

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Error updating User details:", error);
		return NextResponse.json(
			{ error: "An error occurred while updating User details." },
			{ status: 500 }
		);
	}
}

// DELETE handler to delete a User by user_id
export async function DELETE(
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
		// Check if the User exists
		const existingUser = await db
			.select()
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1);

		if (existingUser.length === 0) {
			return NextResponse.json(
				{ error: "User not found." },
				{ status: 404 }
			);
		}

		// Delete the UserDetails associated with the User
		await db.delete(UserDetails).where(eq(UserDetails.user_id, user_id));

		// Delete the User
		await db.delete(User).where(eq(User.id, user_id));

		return NextResponse.json({
			message: "User deleted successfully.",
		});
	} catch (error) {
		console.error("Error deleting User:", error);
		return NextResponse.json(
			{ error: "An error occurred while deleting the User." },
			{ status: 500 }
		);
	}
}

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
		const body = await req.json();
		const { image, newCourse, wishlist, removeFromWishlist } = body;

		// Fetch current User data to avoid overwriting fields
		const existingUser = await db
			.select({
				enrolled_courses: User.enrolled_courses,
				image: User.image,
				wishlist: User.wishlist,
			})
			.from(User)
			.where(eq(User.id, user_id))
			.limit(1)
			.then((rows) => rows[0]);

		if (!existingUser) {
			return NextResponse.json(
				{ error: "User not found." },
				{ status: 404 }
			);
		}

		// Initialize patchData with the current User data
		let patchData = {
			image: existingUser.image,
			enrolled_courses: existingUser.enrolled_courses,
			wishlist: existingUser.wishlist,
		};

		// Update image if provided
		if (image !== undefined && image !== null) {
			patchData.image = image;
		}

		// Append new course if provided
		if (newCourse !== undefined && newCourse !== null) {
			patchData.enrolled_courses = [
				...existingUser.enrolled_courses,
				newCourse,
			];
		}

		// Handle wishlist updates (adding new items)
		if (wishlist !== undefined && wishlist !== null) {
			patchData.wishlist = [...existingUser.wishlist, ...wishlist].filter(
				(item, index, array) => array.indexOf(item) === index // Ensure unique items
			);
		}

		// Handle removal of items from the wishlist
		if (removeFromWishlist !== undefined && removeFromWishlist !== null) {
			const itemsToRemove = Array.isArray(removeFromWishlist)
				? removeFromWishlist
				: [removeFromWishlist]; // Ensure it's always an array

			patchData.wishlist = existingUser.wishlist.filter(
				(item) => !itemsToRemove.includes(item)
			);
		}

		// Only update fields if they are actually changed
		const fieldsToUpdate = Object.fromEntries(
			Object.entries(patchData).filter(
				([key, value]) => value !== undefined && value !== null
			)
		);

		if (Object.keys(fieldsToUpdate).length === 0) {
			return NextResponse.json(
				{ error: "No valid fields to update." },
				{ status: 400 }
			);
		}

		// Update User in the database
		const updatedUser = await db
			.update(User)
			.set(fieldsToUpdate)
			.where(eq(User.id, user_id))
			.returning();

		return NextResponse.json({
			message: "User details updated successfully.",
			updatedUser,
		});
	} catch (error) {
		console.error("Error updating User details:", error);
		return NextResponse.json(
			{ error: "An error occurred while updating User details." },
			{ status: 500 }
		);
	}
}

// export async function GET(
//   req: Request,
//   { params }: { params: { user_id: string } }
// ) {
//   const { user_id } = params;

//   if (!user_id) {
//     return NextResponse.json(
//       { error: "User ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Parse the query parameters from the URL
//     const url = new URL(req.url);
//     const includeEnrolledCourses = url.searchParams.get(
//       "includeEnrolledCourses"
//     );
//     const includeWishlist = url.searchParams.get("includeWishlist");

//     // Perform the base query to fetch User details along with UserDetails and UserSocials
// const [userWithDetailsAndSocials] = await db
//   .select({
//     id: User.id,
//     name: User.name,
//     username: User.username,
//     phone: User.phone,
//     email: User.email,
//     image: User.image,
//     roles: User.roles,
//     is_verified: User.is_verified,
//     created_at: User.created_at,
//     updated_at: User.updated_at,
//     biography: UserDetails.biography,
//     expertise: UserDetails.expertise,
//     registration_date: UserDetails.registration_date,
//     enrolled_courses: User.enrolled_courses,
//     wishlist: User.wishlist,
//     // Socials fields
//     facebook: UserSocials.facebook,
//     twitter: UserSocials.twitter,
//     linkedin: UserSocials.linkedin,
//     website: UserSocials.website,
//     github: UserSocials.github,
//   })
//   .from(User)
//   .leftJoin(UserDetails, eq(User.id, UserDetails.user_id))
//   .leftJoin(UserSocials, eq(User.id, UserSocials.user_id))
//   .where(eq(User.id, user_id))
//   .limit(1);

//     if (!userWithDetailsAndSocials) {
//       return NextResponse.json(
//         { error: "User details not found." },
//         { status: 404 }
//       );
//     }

//     // Structure the socials data
//     const socials = {
//       facebook: userWithDetailsAndSocials.facebook || "",
//       twitter: userWithDetailsAndSocials.twitter || "",
//       linkedin: userWithDetailsAndSocials.linkedin || "",
//       website: userWithDetailsAndSocials.website || "",
//       github: userWithDetailsAndSocials.github || "",
//     };

//     // Prepare response with all details by default
//     const response = {
//       id: userWithDetailsAndSocials.id,
//       name: userWithDetailsAndSocials.name,
//       username: userWithDetailsAndSocials.username,
//       phone: userWithDetailsAndSocials.phone,
//       email: userWithDetailsAndSocials.email,
//       image: userWithDetailsAndSocials.image,
//       roles: userWithDetailsAndSocials.roles,
//       is_verified: userWithDetailsAndSocials.is_verified,
//       created_at: userWithDetailsAndSocials.created_at,
//       updated_at: userWithDetailsAndSocials.updated_at,
//       biography: userWithDetailsAndSocials.biography || "Biography not provided.",
//       expertise: userWithDetailsAndSocials.expertise.length > 0 ? userWithDetailsAndSocials.expertise : ["No expertise provided."],
//       registration_date: userWithDetailsAndSocials.registration_date || "Date not provided",
//       socials, // Include socials
//     };

//     // Conditionally include enrolled_courses and wishlist
//     if (includeEnrolledCourses !== "false") {
//       response['enrolled_courses'] = userWithDetailsAndSocials.enrolled_courses;
//     }

//     if (includeWishlist !== "false") {
//       response['wishlist'] = userWithDetailsAndSocials.wishlist;
//     }

//     // Return the response
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching User details:", error);
//     return NextResponse.json(
//       { error: "An error occurred while fetching User details." },
//       { status: 500 }
//     );
//   }
// }

// Define precise types based on your schema

// Define precise types based on your schema
interface Course {
	id: string;
	title: string;
	// Add other relevant fields
}

interface Socials {
	facebook: string;
	twitter: string;
	linkedin: string;
	website: string;
	github: string;
}

interface UserResponse {
	id: string;
	name: string;
	username: string;
	phone: string;
	email: string;
	image: string;
	roles: string[];
	is_verified: boolean;
	created_at: string;
	updated_at: string;
	biography: string;
	expertise: string[];
	registration_date: string;
	socials: Socials;
	enrolled_courses: Course[];
	wishlist: Course[];
}

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
		// Parse the query parameters from the URL
		const url = new URL(req.url);
		const includeEnrolledCourses =
			url.searchParams.get("includeEnrolledCourses") === "true";
		const includeWishlist =
			url.searchParams.get("includeWishlist") === "true";

		console.log(`Fetching data for user_id: ${user_id}`);
		console.log(`includeEnrolledCourses: ${includeEnrolledCourses}`);
		console.log(`includeWishlist: ${includeWishlist}`);

		// Perform the base query to fetch User details along with UserDetails and UserSocials
		const [fetchedUser] = await db
			.select({
				id: User.id,
				name: User.name,
				username: User.username,
				phone: User.phone,
				email: User.email,
				image: User.image,
				roles: User.roles,
				is_verified: User.is_verified,
				created_at: User.created_at,
				updated_at: User.updated_at,
				biography: UserDetails.biography,
				expertise: UserDetails.expertise,
				registration_date: UserDetails.registration_date,
				enrolled_courses: User.enrolled_courses,
				wishlist: User.wishlist,
				// Socials fields
				facebook: UserSocials.facebook,
				twitter: UserSocials.twitter,
				linkedin: UserSocials.linkedin,
				website: UserSocials.website,
				github: UserSocials.github,
			})
			.from(User)
			.leftJoin(UserDetails, eq(User.id, UserDetails.user_id))
			.leftJoin(UserSocials, eq(User.id, UserSocials.user_id))
			.where(eq(User.id, user_id))
			.limit(1);

		// If User is not found, return a 404 error
		if (!fetchedUser) {
			console.warn(`User with ID ${user_id} not found.`);
			return NextResponse.json(
				{ error: "User with the given ID was not found." },
				{ status: 404 }
			);
		}

		// Handle 'expertise'
		const expertiseProcessed: string[] =
			Array.isArray(fetchedUser.expertise) &&
			fetchedUser.expertise.length > 0
				? fetchedUser.expertise
				: ["No expertise provided."];

		// Handle 'enrolled_courses'
		const enrolledCoursesProcessed: Course[] =
			includeEnrolledCourses &&
			Array.isArray(fetchedUser.enrolled_courses)
				? fetchedUser.enrolled_courses
				: [];

		// Handle 'wishlist'
		const wishlistProcessed: Course[] =
			includeWishlist && Array.isArray(fetchedUser.wishlist)
				? fetchedUser.wishlist
				: [];

		// Structure the socials data with default values
		const socials: Socials = {
			facebook: fetchedUser.facebook || "",
			twitter: fetchedUser.twitter || "",
			linkedin: fetchedUser.linkedin || "",
			website: fetchedUser.website || "",
			github: fetchedUser.github || "",
		};

		// Prepare the response object with default values where necessary
		const response: UserResponse = {
			id: fetchedUser.id,
			name: fetchedUser.name,
			username: fetchedUser.username,
			phone: fetchedUser.phone,
			email: fetchedUser.email,
			image: fetchedUser.image || "/User.png", // Ensure this default image exists in your public directory
			roles:
				Array.isArray(fetchedUser.roles) && fetchedUser.roles.length > 0
					? fetchedUser.roles
					: ["User"],
			is_verified: fetchedUser.is_verified ?? false, // Use nullish coalescing to allow false
			created_at: fetchedUser.created_at,
			updated_at: fetchedUser.updated_at,
			biography: fetchedUser.biography || "Biography not provided.",
			expertise: expertiseProcessed,
			registration_date:
				fetchedUser.registration_date || "Date not provided",
			socials, // Include socials with default values
			enrolled_courses: enrolledCoursesProcessed,
			wishlist: wishlistProcessed,
		};

		console.log("API Response:", response);

		// Return the response
		return NextResponse.json(response);
	} catch (error: any) {
		console.error("Error fetching User details:", error);

		// Return a 500 error with a generic message
		return NextResponse.json(
			{ error: "An error occurred while fetching User details." },
			{ status: 500 }
		);
	}
}

// src/app/api/stripe/webhook.ts

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/db";
import { Orders } from "@/db/schemas/Orders";
import { User } from "@/db/schemas/User";
import { Cart } from "@/db/schemas/Cart"; // Import the Cart schema
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";
import { sendEmail } from "@/libs/emial/emailService"; // Corrected import path
import { eq, inArray } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
	const body = await req.text(); // Parse raw body as text for signature verification
	const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
	const sig = headers().get("stripe-signature") as string;

	let Event: Stripe.Event;

	try {
		// Verify the Event by checking the signature
		Event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
	} catch (err: any) {
		console.error("⚠️ Webhook signature verification failed:", err.message);
		return new Response(`Webhook Error: ${err.message}`, { status: 400 });
	}

	// Handle specific events only
	if (Event.type === "checkout.session.completed") {
		const session = Event.data.object as Stripe.Checkout.Session;

		const user_id = session.metadata?.user_id ?? "";
		const courseIdsString = session.metadata?.courseIds ?? "";

		if (!user_id) {
			console.error("Missing user_id in session metadata");
			return new Response("Missing user_id in session metadata", {
				status: 400,
			});
		}

		if (!courseIdsString) {
			console.error("No course IDs found in metadata");
			return new Response("No course IDs found in metadata", {
				status: 400,
			});
		}

		// Convert the comma-separated string back into an array
		const purchasedCourseIds = courseIdsString.split(",").filter(Boolean);

		const total_amount = session.amount_total
			? session.amount_total / 100
			: 0;
		const payment_method = session.payment_method_types[0] ?? "unknown";

		try {
			// **Fetch Detailed Course Information**
			const courseDetails = await db
				.select({
					course_id: Courses.id,
					name: Courses.title,
					price: Courses.price,
				})
				.from(Courses)
				.where(inArray(Courses.id, purchasedCourseIds));

			console.log("✔️✔️ Courses details for enroll", courseDetails);

			if (courseDetails.length === 0) {
				console.error(
					"No course details found for purchasedCourseIds:",
					purchasedCourseIds
				);
				return new Response("No course details found", { status: 400 });
			}

			// **Construct the items JSON Object**
			const items = courseDetails.map((course) => ({
				course_id: course.course_id,
				name: course.name,
				price: course.price,
				// Add other relevant fields as needed
			}));

			// **Insert the Order into the Database**
			await db.insert(Orders).values({
				user_id,
				status: "completed",
				total_amount,
				payment_method,
				items, // Insert the constructed JSON object
			});

			// **Prepare the Courses to be Added to EnrolledCourses**
			const newCourses = purchasedCourseIds.map((course_id: string) => ({
				course_id,
				progress: 0, // Initially set the progress to 0
				completedLectures: [], // Initialize completedLectures as an empty array
			}));

			// **Fetch the User's Current EnrolledCourses**
			const existingUser = await db
				.select({
					enrolled_courses: User.enrolled_courses,
				})
				.from(User)
				.where(eq(User.id, user_id))
				.limit(1);

			if (!existingUser.length) {
				console.error("User not found:", user_id);
				return new Response(`User with ID ${user_id} not found`, {
					status: 404,
				});
			}

			const existingCourses = existingUser[0].enrolled_courses || [];

			// **Update EnrolledCourses, Only Adding New Courses**
			const updatedEnrolledCourses = [
				...existingCourses,
				...newCourses.filter(
					(newCourse) =>
						!existingCourses.some(
							(existingCourse: any) =>
								existingCourse.course_id === newCourse.course_id
						)
				),
			];

			await db
				.update(User)
				.set({
					enrolled_courses: updatedEnrolledCourses,
				})
				.where(eq(User.id, user_id));

			// **Unlock Lectures for Purchased Courses**

			// Fetch all Chapters associated with the purchased Courses
			const chaptersList = await db
				.select({
					id: Chapters.id,
				})
				.from(Chapters)
				.where(inArray(Chapters.course_id, purchasedCourseIds));

			// Extract the chapter IDs
			const chapterIds = chaptersList.map((chapter) => chapter.id);

			// Update Lectures to set is_locked to false where chapter_id is in chapterIds
			await db
				.update(Lectures)
				.set({ is_locked: false })
				.where(inArray(Lectures.chapter_id, chapterIds));

			console.log(
				`Lectures unlocked for User ${user_id} and Courses ${purchasedCourseIds}`
			);

			// **Remove Purchased Courses from Cart**

			// Fetch Cart items for the User
			const cartItems = await db
				.select({
					id: Cart.id,
					course_id: Cart.course_id,
				})
				.from(Cart)
				.where(eq(Cart.user_id, user_id));

			// Identify Cart items that match purchased Courses
			const cartItemsToRemove = cartItems.filter((cartItem) =>
				purchasedCourseIds.includes(cartItem.course_id)
			);

			// Extract Cart item IDs to remove
			const cartItemIdsToRemove = cartItemsToRemove.map(
				(item) => item.id
			);

			// Delete the purchased Courses from the Cart
			if (cartItemIdsToRemove.length > 0) {
				await db
					.delete(Cart)
					.where(inArray(Cart.id, cartItemIdsToRemove));
			}

			console.log(
				`Removed purchased Courses from Cart for User ${user_id}`
			);

			// **Prepare Email Template Data**

			const courseNames = courseDetails
				.map((course) => course.name)
				.join(", ");

			const emailTemplateData = {
				userName: session.customer_details?.name || "Customer",
				total_amount: total_amount.toFixed(2),
				orderDate: new Date().toLocaleDateString(),
				courseName: courseNames || "Your Courses", // Use course names instead of IDs
				instructorName: "Instructor Name", // Adjust as needed or fetch dynamically
				coursePrice: total_amount.toFixed(2),
				discountAmount: "0.00",
				amountPaid: total_amount.toFixed(2),
			};

			// **Send Order Confirmation Email**
			await sendEmail({
				to: session.customer_details?.email ?? "User@example.com",
				subject: "Your Order Confirmation",
				text: "Thank you for your order!",
				templateName: "orderConfirmation",
				templateData: emailTemplateData,
			});

			return new Response(
				"Order saved, Lectures unlocked, Cart updated, and email sent",
				{
					status: 200,
				}
			);
		} catch (error) {
			console.error("Error processing order or email:", error);
			return new Response("Error processing order", { status: 500 });
		}
	} else {
		// Handle other Event types safely
		console.log("Unhandled Event type:", Event.type);
		return new Response("Event ignored", { status: 200 });
	}
}
// // src/app/api/stripe/webhook.ts

// import { NextRequest } from 'next/server';
// import Stripe from 'stripe';
// import { headers } from 'next/headers';
// import { db } from '@/db';
// import { Orders } from '@/db/schemas/Orders';
// import { User } from '@/db/schemas/User';
// import { Cart } from '@/db/schemas/Cart'; // Import the Cart schema
// import { Chapters } from '@/db/schemas/Chapters';
// import { Lectures } from '@/db/schemas/Lectures';
// import { sendEmail } from '@/libs/emial/emailService';
// import { eq, inArray } from 'drizzle-orm';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
// });

// export async function POST(req: NextRequest) {
//   const body = await req.text(); // Parse raw body as text for signature verification
//   const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
//   const sig = headers().get('stripe-signature') as string;

//   let Event: Stripe.Event;

//   try {
//     // Verify the Event by checking the signature
//     Event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//   } catch (err: any) {
//     console.error('⚠️ Webhook signature verification failed:', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // Handle specific events only
//   if (Event.type === 'checkout.session.completed') {
//     const session = Event.data.object as Stripe.Checkout.Session;

//     const user_id = session.metadata?.user_id ?? '';
//     const courseIdsString = session.metadata?.courseIds ?? '';

//     if (!user_id) {
//       console.error('Missing user_id in session metadata');
//       return new Response('Missing user_id in session metadata', { status: 400 });
//     }

//     if (!courseIdsString) {
//       console.error('No course IDs found in metadata');
//       return new Response('No course IDs found in metadata', { status: 400 });
//     }

//     // Convert the comma-separated string back into an array
//     const purchasedCourseIds = courseIdsString.split(',').filter(Boolean);

//     const total_amount = session.amount_total ? session.amount_total / 100 : 0;
//     const payment_method = session.payment_method_types[0] ?? 'unknown';

//     try {
//       // Insert the order into the database
//       await db.insert(Orders).values({
//         user_id,
//         status: 'completed',
//         total_amount,
//         payment_method,
//         items: purchasedCourseIds, // Store course IDs
//       });

//       // Prepare the Courses to be added to enrolled_courses
//       const newCourses = purchasedCourseIds.map((course_id: string) => ({
//         course_id,
//         progress: 0, // Initially set the progress to 0
//       }));

//       // Fetch the User's current enrolled_courses
//       const existingUser = await db
//         .select({
//           enrolled_courses: User.enrolled_courses,
//         })
//         .from(User)
//         .where(eq(User.id, user_id))
//         .limit(1);

//       if (!existingUser.length) {
//         console.error('User not found:', user_id);
//         return new Response(`User with ID ${user_id} not found`, { status: 404 });
//       }

//       const existingCourses = existingUser[0].enrolled_courses || [];

//       // Update enrolled_courses, only adding new Courses that aren't already present
//       const updatedEnrolledCourses = [
//         ...existingCourses,
//         ...newCourses.filter(
//           (newCourse) =>
//             !existingCourses.some(
//               (existingCourse: any) => existingCourse.course_id === newCourse.course_id
//             )
//         ),
//       ];

//       await db
//         .update(User)
//         .set({
//           enrolled_courses: updatedEnrolledCourses,
//         })
//         .where(eq(User.id, user_id));

//       // **Unlock Lectures for Purchased Courses**

//       // Fetch all Chapters associated with the purchased Courses
//       const chaptersList = await db
//         .select({
//           id: Chapters.id,
//         })
//         .from(Chapters)
//         .where(inArray(Chapters.course_id, purchasedCourseIds));

//       // Extract the chapter IDs
//       const chapterIds = chaptersList.map((chapter) => chapter.id);

//       // Update Lectures to set is_locked to false where chapter_id is in chapterIds
//       await db
//         .update(Lectures)
//         .set({ is_locked: false })
//         .where(inArray(Lectures.chapter_id, chapterIds));

//       console.log(`Lectures unlocked for User ${user_id} and Courses ${purchasedCourseIds}`);

//       // **Remove Purchased Courses from Cart**

//       // Fetch Cart items for the User
//       const cartItems = await db
//         .select({
//           id: Cart.id,
//           course_id: Cart.course_id,
//         })
//         .from(Cart)
//         .where(eq(Cart.user_id, user_id));

//       // Identify Cart items that match purchased Courses
//       const cartItemsToRemove = cartItems.filter((cartItem) =>
//         purchasedCourseIds.includes(cartItem.course_id)
//       );

//       // Extract Cart item IDs to remove
//       const cartItemIdsToRemove = cartItemsToRemove.map((item) => item.id);

//       // Delete the purchased Courses from the Cart
//       if (cartItemIdsToRemove.length > 0) {
//         await db.delete(Cart).where(inArray(Cart.id, cartItemIdsToRemove));
//       }

//       console.log(`Removed purchased Courses from Cart for User ${user_id}`);

//       // Send order confirmation email
//       const emailTemplateData = {
//         userName: session.customer_details?.name || 'Customer',
//         total_amount: total_amount.toFixed(2),
//         orderDate: new Date().toLocaleDateString(),
//         courseName: 'Your Courses', // Adjust as needed
//         instructorName: 'Instructor Name', // Adjust as needed
//         coursePrice: total_amount.toFixed(2),
//         discountAmount: '0.00',
//         amountPaid: total_amount.toFixed(2),
//       };

//       await sendEmail({
//         to: session.customer_details?.email ?? 'User@example.com',
//         subject: 'Your Order Confirmation',
//         text: 'Thank you for your order!',
//         templateName: 'orderConfirmation',
//         templateData: emailTemplateData,
//       });

//       return new Response('Order saved, Lectures unlocked, Cart updated, and email sent', {
//         status: 200,
//       });
//     } catch (error) {
//       console.error('Error processing order or email:', error);
//       return new Response('Error processing order', { status: 500 });
//     }
//   } else {
//     // Handle other Event types safely
//     console.log('Unhandled Event type:', Event.type);
//     return new Response('Event ignored', { status: 200 });
//   }
// }

// // src/app/api/stripe/webhook.ts

// import { NextRequest } from "next/server";
// import Stripe from "stripe";
// import { headers } from "next/headers";
// import { db } from "@/db";
// import { Orders } from "@/db/schemas/Orders";
// import { User } from "@/db/schemas/User";
// import { Cart } from "@/db/schemas/Cart"; // Import the Cart schema
// import { Chapters } from "@/db/schemas/Chapters";
// import { Lectures } from "@/db/schemas/Lectures";
// import { sendEmail } from "@/libs/emial/emailService";
// import { eq, inArray, and } from "drizzle-orm";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

// export async function POST(req: NextRequest) {
//   const body = await req.text(); // Parse raw body as text for signature verification
//   const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
//   const sig = headers().get("stripe-signature") as string;

//   let Event: Stripe.Event;

//   try {
//     console.log("Raw body:", body); // Log the raw body for debugging
//     console.log("Stripe signature:", sig); // Log the signature for debugging

//     // Verify the Event by checking the signature
//     Event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//   } catch (err: any) {
//     console.error("⚠️ Webhook signature verification failed:", err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // Log the Event type to track incoming events
//   console.log("Received Event type:", Event.type);

//   // Handle specific events only
//   if (Event.type === "checkout.session.completed") {
//     const session = Event.data.object as Stripe.Checkout.Session;

//     const user_id = session.metadata?.user_id ?? "";
//     const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

//     if (!user_id) {
//       console.error("Missing user_id in session metadata");
//       return new Response("Missing user_id in session metadata", { status: 400 });
//     }

//     const total_amount = session.amount_total ? session.amount_total / 100 : 0;
//     const payment_method = session.payment_method_types[0] ?? "unknown";

//     try {
//       // Insert the order into the database
//       await db.insert(Orders).values({
//         user_id,
//         status: "completed",
//         total_amount,
//         payment_method,
//         items,
//       });

//       // Prepare the Courses to be added to enrolled_courses
//       const newCourses = items.map((item: any) => ({
//         course_id: item?.course_id || "", // Handle undefined or missing course_id
//         progress: 0, // Initially set the progress to 0
//       }));

//       // Fetch the User's current enrolled_courses
//       const existingUser = await db
//         .select({
//           enrolled_courses: User.enrolled_courses,
//         })
//         .from(User)
//         .where(eq(User.id, user_id))
//         .limit(1);

//       if (!existingUser.length) {
//         console.error("User not found:", user_id);
//         return new Response(`User with ID ${user_id} not found`, { status: 404 });
//       }

//       const existingCourses = existingUser[0].enrolled_courses || [];

//       // Update enrolled_courses, only adding new Courses that aren't already present
//       const updatedEnrolledCourses = [
//         ...existingCourses,
//         ...newCourses.filter(
//           (newCourse) =>
//             !existingCourses.some(
//               (existingCourse: any) => existingCourse.course_id === newCourse.course_id
//             )
//         ),
//       ];

//       await db
//         .update(User)
//         .set({
//           enrolled_courses: updatedEnrolledCourses,
//         })
//         .where(eq(User.id, user_id));

//       // **Unlock Lectures for Purchased Courses**
//       // a. Get the list of purchased course IDs
//       const purchasedCourseIds = newCourses.map((course) => course.course_id);

//       // b. Fetch all Chapters associated with the purchased Courses
//       const chaptersList = await db
//         .select({
//           id: Chapters.id,
//         })
//         .from(Chapters)
//         .where(inArray(Chapters.course_id, purchasedCourseIds));

//       // c. Extract the chapter IDs
//       const chapterIds = chaptersList.map((chapter) => chapter.id);

//       // d. Update Lectures to set is_locked to false where chapter_id is in chapterIds
//       await db
//         .update(Lectures)
//         .set({ is_locked: false })
//         .where(inArray(Lectures.chapter_id, chapterIds));

//       console.log(`Lectures unlocked for User ${user_id} and Courses ${purchasedCourseIds}`);

//       // **Remove Purchased Courses from Cart**

//       // Fetch Cart items for the User
//       const cartItems = await db
//         .select({
//           id: Cart.id,
//           course_id: Cart.course_id,
//         })
//         .from(Cart)
//         .where(eq(Cart.user_id, user_id));

//       // Identify Cart items that match purchased Courses
//       const cartItemsToRemove = cartItems.filter((cartItem) =>
//         purchasedCourseIds.includes(cartItem.course_id)
//       );

//       // Extract Cart item IDs to remove
//       const cartItemIdsToRemove = cartItemsToRemove.map((item) => item.id);
//       // console.log("cartItemIdsToRemove",cartItemIdsToRemove)

//       // Delete the purchased Courses from the Cart
//       if (cartItemIdsToRemove.length > 0) {
//         await db.delete(Cart).where(inArray(Cart.id, cartItemIdsToRemove));
//       }

//       console.log(`Removed purchased Courses from Cart for User ${user_id}`);

//       // Send order confirmation email
//       const emailTemplateData = {
//         userName: session.customer_details?.name || "Customer",
//         total_amount: total_amount.toFixed(2),
//         orderDate: new Date().toLocaleDateString(),
//         courseName: items.length > 0 ? items[0].name : "Course Name",
//         instructorName: "Instructor Name",
//         coursePrice: total_amount.toFixed(2),
//         discountAmount: "0.00",
//         amountPaid: total_amount.toFixed(2),
//       };

//       await sendEmail({
//         to: session.customer_details?.email ?? "User@example.com",
//         subject: "Your Order Confirmation",
//         text: "Thank you for your order!",
//         templateName: "orderConfirmation",
//         templateData: emailTemplateData,
//       });

//       return new Response("Order saved, Lectures unlocked, Cart updated, and email sent", {
//         status: 200,
//       });
//     } catch (error) {
//       console.error("Error processing order or email:", error);
//       return new Response("Error processing order", { status: 500 });
//     }
//   } else {
//     // Handle other Event types safely
//     console.log("Unhandled Event type:", Event.type);
//     return new Response("Event ignored", { status: 200 });
//   }
// }

import { NextResponse } from "next/server";
import { db } from "@/db"; // Assuming you have a db file for your Drizzle ORM connection
import { Orders } from "@/db/schemas/Orders";
import { sendEmail } from "@/libs/emial/emailService"; // Assuming your email service is in services folder
import { eq, sql } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { User } from "@/db/schemas/User";

export const dynamic = "force-dynamic";

// POST handler to complete an order
export async function POST(req: Request) {
	try {
		const { user_id, items, total_amount, payment_method } =
			await req.json();

		// Validate the required data
		if (!user_id || !items || !total_amount || !payment_method) {
			return NextResponse.json(
				{ error: "Invalid order data." },
				{ status: 400 }
			);
		}

		// Insert the order into the database
		const [newOrder] = await db
			.insert(Orders)
			.values({
				user_id,
				status: "completed", // Set the status as completed
				total_amount,
				payment_method,
				items,
			})
			.returning("*");

		// If order insertion fails
		if (!newOrder) {
			return NextResponse.json(
				{ error: "Failed to save the order." },
				{ status: 500 }
			);
		}

		// Send email confirmation
		const emailTemplateData = {
			userName: "Customer Name", // Replace with actual User data if available
			total_amount: total_amount.toString(),
			orderDate: new Date().toLocaleDateString(),
			orderItems: items
				.map((item) => `${item.name} - $${item.price}`)
				.join(", "),
		};

		await sendEmail({
			to: "User@example.com", // Replace with actual User email
			subject: "Your Order Confirmation",
			text: "Thank you for your order!",
			templateName: "orderConfirmation",
			templateData: emailTemplateData,
		});

		return NextResponse.json(
			{
				message: "Order completed and email sent.",
				orderId: newOrder.id,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Order completion error:", error);
		return NextResponse.json(
			{ error: "Failed to complete the order." },
			{ status: 500 }
		);
	}
}

// Define a type for the count result
type CountResult = { count: string };

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const user_id = searchParams.get("user_id");
		const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1 if not provided
		const limit = parseInt(searchParams.get("limit") || "10", 10); // Default to 10 items per page
		const offset = (page - 1) * limit;

		// **Step 1: Validate `user_id`**
		if (!user_id) {
			return NextResponse.json(
				{ error: "Missing user_id in query parameters." },
				{ status: 400 }
			);
		}

		// **Step 2: Fetch the Courses Owned by the Instructor**
		const instructorCourses = await db
			.select({
				course_id: Courses.id,
				title: Courses.title,
			})
			.from(Courses)
			.where(sql`${Courses.user_id} = ${user_id}`);

		if (instructorCourses.length === 0) {
			return NextResponse.json(
				{ message: "No Courses found for this instructor." },
				{ status: 404 }
			);
		}

		// **Step 3: Extract `courseIds`**
		const courseIds = instructorCourses.map((course) => course.course_id);
		console.log("Course IDs:", courseIds); // For debugging purposes

		// **Step 4: Count Total Matching Orders**
		const totalOrdersResult = await db
			.select({
				count: sql`COUNT(*)`.as("count"),
			})
			.from(Orders)
			.where(
				sql`EXISTS (
          SELECT 1 FROM json_array_elements(${Orders.items}) AS elem
          WHERE elem->>'course_id' IN (${sql.join(
				courseIds.map((id) => sql`${id}`),
				sql`, `
			)})
        )`
			);

		// **Step 5: Extract and Parse the Count**
		const countResult = totalOrdersResult[0] as CountResult;
		const totalRecords = parseInt(countResult?.count || "0", 10);
		console.log("Total Orders Count:", totalRecords); // For debugging purposes

		// **Step 6: Handle No Matching Orders**
		if (totalRecords === 0) {
			return NextResponse.json(
				{ message: "No Orders found for the instructor's Courses." },
				{ status: 404 }
			);
		}

		// **Step 7: Fetch Paginated Orders**
		const paginatedOrders = await db
			.select({
				orderId: Orders.id,
				user_id: Orders.user_id,
				unique_identifier: User.unique_identifier, // Include unique_identifier
				items: Orders.items,
				total_amount: Orders.total_amount,
				payment_method: Orders.payment_method,
				created_at: Orders.created_at,
				status: Orders.status,
			})
			.from(Orders)
			.innerJoin(User, eq(Orders.user_id, User.id))
			.where(
				sql`EXISTS (
          SELECT 1 FROM json_array_elements(${Orders.items}) AS elem
          WHERE elem->>'course_id' IN (${sql.join(
				courseIds.map((id) => sql`${id}`),
				sql`, `
			)})
        )`
			)
			.limit(limit)
			.offset(offset)
			.orderBy(Orders.created_at, "desc");

		// console.log("Paginated Orders:", paginatedOrders); // For debugging purposes

		// **Step 8: Calculate Pagination Metadata**
		const totalPages = Math.ceil(totalRecords / limit);
		const hasNext = offset + limit < totalRecords;
		const hasPrevious = page > 1;

		// **Step 9: Return the Response**
		return NextResponse.json({
			message: "Orders fetched successfully",
			length: paginatedOrders.length,
			total: totalRecords,
			page,
			perPage: limit,
			hasNext,
			hasPrevious,
			data: paginatedOrders,
		});
	} catch (error) {
		console.error("Error fetching Orders for instructor:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch Orders.",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

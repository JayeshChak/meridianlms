// src/app/api/Orders/[user_id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import according to your project setup
import { Orders } from "@/db/schemas/Orders"; // Adjust the import according to your project setup
import { eq } from "drizzle-orm";

export async function POST(
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

		// Extract the fields from the request body
		const { status, total_amount, payment_method, items } = body;

		// Validate fields
		if (!status || !total_amount || !payment_method || !items) {
			return NextResponse.json(
				{ error: "All fields are required." },
				{ status: 400 }
			);
		}

		// Insert the new order into the database
		const newOrder = await db
			.insert(Orders)
			.values({
				user_id,
				status,
				total_amount,
				payment_method,
				items,
			})
			.returning();

		return NextResponse.json({
			message: "Order created successfully.",
			order: newOrder,
		});
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ error: "An error occurred while creating the order." },
			{ status: 500 }
		);
	}
}

export async function GET(
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
		// Fetch all Orders for the given user_id
		const userOrders = await db
			.select()
			.from(Orders)
			.where(eq(Orders.user_id, user_id));

		if (userOrders.length === 0) {
			return NextResponse.json(
				{ message: "No Orders found for this User." },
				{ status: 404 }
			);
		}

		return NextResponse.json({ Orders: userOrders });
	} catch (error) {
		console.error("Error fetching Orders:", error);
		return NextResponse.json(
			{ error: "An error occurred while fetching Orders." },
			{ status: 500 }
		);
	}
}

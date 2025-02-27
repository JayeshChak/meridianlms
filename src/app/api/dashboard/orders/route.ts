import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust this import path to your project structure
import { Orders } from "@/db/schemas/Orders";
import { User } from "@/db/schemas/User";
import { sql, eq } from "drizzle-orm";

// Helper function to get chart data
async function getDashboardData() {
	try {
		// 1. Sales Distribution by Payment Method
		const paymentMethodData = await db
			.select({
				payment_method: Orders.payment_method,
				totalSales: sql`SUM(${Orders.total_amount})`.as("totalSales"),
			})
			.from(Orders)
			.groupBy(Orders.payment_method);

		// 2. Orders Status Breakdown
		const orderStatusData = await db
			.select({
				status: Orders.status,
				count: sql`COUNT(*)`.as("count"),
			})
			.from(Orders)
			.groupBy(Orders.status);

		// 3. Revenue by User Type
		const userRevenueData = await db
			.select({
				user_id: User.id,
				name: User.name,
				totalRevenue: sql`SUM(${Orders.total_amount})`.as(
					"totalRevenue"
				),
			})
			.from(Orders)
			.leftJoin(User, eq(Orders.user_id, User.id))
			.groupBy(User.id)
			.orderBy(sql`SUM(${Orders.total_amount})`, "desc");

		// 4. Revenue Over Time (e.g., by month)
		const revenueOverTimeData = await db
			.select({
				month: sql`TO_CHAR(${Orders.created_at}, 'YYYY-MM')`.as(
					"month"
				), // Group by month-year
				totalRevenue: sql`SUM(${Orders.total_amount})`.as(
					"totalRevenue"
				),
			})
			.from(Orders)
			.groupBy(sql`TO_CHAR(${Orders.created_at}, 'YYYY-MM')`)
			.orderBy(sql`TO_CHAR(${Orders.created_at}, 'YYYY-MM')`);

		// 5. Top Selling Courses (using course names)
		const topSellingCoursesData = await db
			.select({
				courseName:
					sql`jsonb_array_elements(${Orders.items}::jsonb)->>'name'`.as(
						"courseName"
					),
				totalEnrollments: sql`COUNT(*)`.as("totalEnrollments"), // Count enrollments per course
			})
			.from(Orders)
			.groupBy(sql`jsonb_array_elements(${Orders.items}::jsonb)->>'name'`)
			.orderBy(sql`COUNT(*)`, "desc")
			.limit(5);

		// 6. Order Volume Trend (by day)
		const orderVolumeTrendData = await db
			.select({
				date: sql`TO_CHAR(${Orders.created_at}, 'YYYY-MM-DD')`.as(
					"date"
				),
				orderCount: sql`COUNT(*)`.as("orderCount"),
			})
			.from(Orders)
			.groupBy(sql`TO_CHAR(${Orders.created_at}, 'YYYY-MM-DD')`)
			.orderBy(sql`TO_CHAR(${Orders.created_at}, 'YYYY-MM-DD')`);

		return {
			paymentMethodData,
			orderStatusData,
			userRevenueData,
			revenueOverTimeData,
			topSellingCoursesData,
			orderVolumeTrendData,
		};
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		throw new Error("Error fetching dashboard data");
	}
}

// API Route to expose the dashboard data
export async function GET() {
	try {
		const data = await getDashboardData();
		return NextResponse.json({ data });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch dashboard data" },
			{ status: 500 }
		);
	}
}

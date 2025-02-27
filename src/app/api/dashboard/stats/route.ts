import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the path as per your structure
import { Courses } from "@/db/schemas/Courses";
import { User } from "@/db/schemas/User";
import { sql, eq, gte } from "drizzle-orm";

// Function to get the required statistics
async function getCounts() {
	try {
		// Fetch all users and their enrolled_courses
		const usersWithEnrolledCourses = await db
			.select({
				enrolled_courses: User.enrolled_courses,
			})
			.from(User)
			.execute();

		// Count total enrolled Courses
		const totalEnrolledCourses = usersWithEnrolledCourses.reduce(
			(total, currentUser) => {
				const coursesCount = currentUser.enrolled_courses
					? currentUser.enrolled_courses.length
					: 0;
				return total + coursesCount;
			},
			0
		);

		// Count completed Courses based on progress (e.g., 100% completion)
		const completedCourses = usersWithEnrolledCourses.reduce(
			(total, currentUser) => {
				const completedCount = currentUser.enrolled_courses
					? currentUser.enrolled_courses.filter(
							(course) => course.progress === 100
					  ).length
					: 0;
				return total + completedCount;
			},
			0
		);

		// Query for active Courses
		const activeCourses = await db
			.select({
				activeCourses: sql`COUNT(*)`.as("activeCourses"),
			})
			.from(Courses)
			.where(eq(Courses.is_published, true)) // Only include published Courses
			.execute();

		// Query for total Courses
		const totalCourses = await db
			.select({
				totalCourses: sql`COUNT(*)`.as("totalCourses"),
			})
			.from(Courses)
			.execute();

		// Query for total students (users)
		const totalStudents = await db
			.select({
				totalStudents: sql`COUNT(*)`.as("totalStudents"),
			})
			.from(User)
			.execute();

		// Construct the counts array
		const counts = [
			{
				name: "Enrolled Courses",
				image: "/images/counter1.png",
				data: totalEnrolledCourses || 0,
				symbol: "+",
			},
			{
				name: "Active Courses",
				image: "/images/counter2.png",
				data: activeCourses[0]?.activeCourses || 0,
				symbol: "+",
			},
			{
				name: "Completed Courses",
				image: "/images/counter3.png",
				data: completedCourses || 0,
				symbol: "+",
			},
			{
				name: "Total Courses",
				image: "/images/counter4.png",
				data: totalCourses[0]?.totalCourses || 0,
				symbol: "+",
			},
			{
				name: "Total Students",
				image: "/images/counter5.png",
				data: totalStudents[0]?.totalStudents || 0,
				symbol: "+",
			},
			{
				name: "OVER THE WORLD",
				image: "/images/counter6.png",
				data: totalCourses[0]?.totalCourses || 0, // Static data, change as per your requirement
				symbol: "+",
			},
		];

		return counts;
	} catch (error) {
		console.error("Error fetching counts:", error);
		throw new Error("Error fetching counts");
	}
}

// API handler function
export async function GET() {
	try {
		const counts = await getCounts();
		return NextResponse.json({ counts });
	} catch (error) {
		console.error("Error fetching counts:", error);
		return NextResponse.json(
			{ error: `Failed to fetch counts: ${error.message}` },
			{ status: 500 }
		);
	}
}

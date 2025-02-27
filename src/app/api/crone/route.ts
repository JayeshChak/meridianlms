import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the path based on your project structure
import { Courses } from "@/db/schemas/Courses";
import { Chapters } from "@/db/schemas/Chapters";
import { Lectures } from "@/db/schemas/Lectures";

// Function to handle the GET request
export async function GET(req: Request) {
	// Extract the query parameters
	const { searchParams } = new URL(req.url);
	const user_id = searchParams.get("user_id"); // Get user_id from the query params

	// Check if user_id is passed
	if (!user_id) {
		return NextResponse.json(
			{ error: "user_id is required as a query parameter" },
			{ status: 400 }
		);
	}

	try {
		// Insert Full Stack Developer course
		const courseData = {
			title: "Full Stack Engineer",
			slug: "full-stack-engineer",
			lesson: "Introduction to Full Stack Development",
			duration: "50 hours",
			description:
				"Comprehensive course on becoming a full stack developer",
			featured: true,
			price: 299.99,
			estimated_price: 499.99,
			is_free: false,
			tag: "Full Stack",
			skill_level: "Intermediate",
			Categories: ["Development", "Web", "Full Stack"],
			instructor_name: "Aqeel Shahzad",
			thumbnail:
				"https://res.cloudinary.com/ddj5gisb3/image/upload/v1725361134/Courses/images_otkprf.jpg",
			user_id, // Use the user_id from query params
			demo_video_url: "D:\\lms\\public\\uploads\\full-stack-intro.mp4",
			is_published: true,
		};

		const [newCourse] = await db
			.insert(Courses)
			.values(courseData)
			.returning();
		console.log("Course inserted successfully:", newCourse);

		// Insert Chapters for Full Stack Developer course
		const chaptersData = [
			{
				course_id: newCourse.id,
				title: "Introduction to Full Stack Development",
				description:
					"Overview of Full Stack Development and its importance",
				order: "1",
				duration: "2 hours",
			},
			{
				course_id: newCourse.id,
				title: "Frontend Basics: HTML, CSS, JavaScript",
				description: "Learn the fundamentals of frontend development",
				order: "2",
				duration: "8 hours",
			},
			{
				course_id: newCourse.id,
				title: "Backend Basics: Node.js and Express",
				description:
					"Understanding backend development with Node.js and Express",
				order: "3",
				duration: "10 hours",
			},
			{
				course_id: newCourse.id,
				title: "Databases: SQL & NoSQL",
				description: "Introduction to database technologies",
				order: "4",
				duration: "10 hours",
			},
			{
				course_id: newCourse.id,
				title: "Full Stack Project: Building a Web Application",
				description:
					"Hands-on project to build a full stack web application",
				order: "5",
				duration: "20 hours",
			},
		];

		const insertedChapters = await db
			.insert(Chapters)
			.values(chaptersData)
			.returning();
		console.log("Chapters inserted successfully:", insertedChapters);

		// Insert Lectures for each chapter
		const lectureData = insertedChapters.flatMap((chapter, index) => {
			return Array.from({ length: 5 }).map((_, i) => ({
				chapter_id: chapter.id,
				title: `Lecture ${i + 1} for ${chapter.title}`,
				description: `In-depth details for lecture ${i + 1} in ${
					chapter.title
				}`,
				duration: "1 hour",
				video_url: "D:\\lms\\public\\uploads\\full-stack-lecture.mp4", // Placeholder, replace with actual videos
				is_preview: i === 0, // First lecture is a preview
				is_locked: i !== 0, // All Lectures except the first are locked
				order: `${index + 1}.${i + 1}`,
			}));
		});

		await db.insert(Lectures).values(lectureData);
		console.log("Lectures inserted successfully");

		return NextResponse.json({
			message:
				"Full Stack Developer course, Chapters, and Lectures inserted successfully",
		});
	} catch (error) {
		console.error("Error inserting course, Chapters, and Lectures:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

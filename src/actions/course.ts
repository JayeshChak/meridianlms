import { BASE_URL } from "./constant";

export const fetchLessonById = async (id: string) => {
	try {
		const res = await fetch(`${BASE_URL}/api/lessons/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error("Failed to fetch lesson");
		}
		const lesson = await res.json();
		return lesson;
	} catch (error) {
		console.error("Error fetching lesson:", error);
		return null;
	}
};
export const fetchEnrolledCourses = async (user_id: string) => {
	try {
		const res = await fetch(
			`${BASE_URL}/api/User/${user_id}/enrollCourses`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);
		if (!res.ok) {
			throw new Error("Failed to fetch enrolled Courses");
		}
		const enrolled_courses = await res.json();
		return enrolled_courses;
	} catch (error) {
		console.error("Error fetching enrolled Courses:", error);
		return [];
	}
};

// Fetch course data based on chapter_id
export const fetchCourseByChapterId = async (chapter_id: string) => {
	try {
		const res = await fetch(
			`${BASE_URL}/api/Courses/Chapters/${chapter_id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);
		if (!res.ok) {
			if (res.status === 404) {
				throw new Error("Chapter not found");
			}
			throw new Error("Failed to fetch course by chapter_id");
		}
		const courseData = await res.json();
		return courseData;
	} catch (error) {
		console.error("Error fetching course:", error);
		return null;
	}
};

// Convert local path to URL for videos
export const convertLocalPathToUrl = (video_url: string) => {
	if (video_url.startsWith("D:\\AI_LMS\\public\\uploads\\")) {
		return video_url.replace("D:\\AI_LMS\\public\\uploads\\", "/uploads/");
	}
	return video_url;
};

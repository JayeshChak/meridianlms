export async function getEnrollCoursesFromIds(Courses = []) {
	try {
		// Check if the Courses array is empty
		if (!Courses.length) {
			throw new Error("No Courses provided.");
		}

		// Fetch course details for each course_id
		const courseDetailsPromises = Courses.map(async ({ course_id }) => {
			try {
				const response = await fetch(`/api/Courses/${course_id}`, {
					method: "GET",
				});

				if (!response.ok) {
					// Log error response for better debugging
					const errorText = await response.text();
					console.error(
						`Error fetching course with ID: ${course_id}`,
						errorText
					);
					throw new Error(
						`Failed to fetch course with ID: ${course_id}`
					);
				}

				return await response.json(); // Return the parsed JSON course data
			} catch (error) {
				console.error(`Fetch error for course ID ${course_id}:`, error);
				return null; // Return null to keep other fetches from failing
			}
		});

		// Wait for all promises to resolve
		const courseDetails = await Promise.all(courseDetailsPromises);

		// Filter out any null (failed) fetches
		const validCourses = courseDetails.filter((course) => course !== null);

		if (!validCourses.length) {
			throw new Error("No valid Courses fetched.");
		}

		return validCourses;
	} catch (error) {
		console.error("Error in getEnrollCoursesFromIds:", error);
		throw error;
	}
}

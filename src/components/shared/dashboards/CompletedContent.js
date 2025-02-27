import { useState, useEffect } from "react";
import CourseCard from "../Courses/CourseCard";
import { getEnrollCoursesFromIds } from "@/actions/getEnrollCourses"; // Ensure this function is available to fetch Courses by ID
// import useSweetAlert from "@/hooks/useSweetAlert"; // Assuming you're using SweetAlert for notifications

const CompletedContent = ({ enrolled_courses }) => {
	const [loading, setLoading] = useState(false);
	const [completedCourses, setCompletedCourses] = useState([]);
	// const showAlert = useSweetAlert();

	// console.log("Enrolled Courses provided:Courses,completedCourses", completedCourses?.data);

	// Fetch enrolled Courses details
	useEffect(() => {
		const fetchCompletedCourses = async () => {
			if (!enrolled_courses?.length) {
				console.warn("No enrolled Courses provided.");
				return;
			}

			setLoading(true);

			try {
				// Filter enrolled Courses where progress is 100%
				const completedEnrolledCourses = enrolled_courses.filter(
					(course) => course.progress === 100
				);

				// If no Courses have 100% progress, show a message
				if (!completedEnrolledCourses.length) {
					console.warn("No completed Courses found.");
					setCompletedCourses([]); // Set an empty array
					return;
				}

				// Fetch the course details for Courses with 100% progress
				const courseDetails = await getEnrollCoursesFromIds(
					completedEnrolledCourses
				);

				if (Array.isArray(courseDetails)) {
					setCompletedCourses(courseDetails);
				} else {
					throw new Error("Invalid response format");
				}
			} catch (err) {
				console.error("Failed to fetch completed Courses:", err);
				// showAlert.error("Failed to load completed Courses.");
				setCompletedCourses([]); // Set an empty array on error
			} finally {
				setLoading(false);
			}
		};

		fetchCompletedCourses();
	}, [enrolled_courses]);

	if (loading) {
		return <p>Loading completed Courses...</p>;
	}

	if (!completedCourses.length) {
		return <p>No completed Courses found.</p>;
	}

	return completedCourses?.map((course, idx) => (
		<CourseCard
			key={idx}
			course={course?.data}
			enrolled_courses={enrolled_courses}
			type={"primary"}
		/>
	));
};

export default CompletedContent;

// import CourseCard from "../Courses/CourseCard";

// const CompletedContent = ({ Courses }) => {

//   return Courses?.map((course, idx) => (
//     <CourseCard key={idx} course={course} type={"primary"} />
//   ));
// };

// export default CompletedContent;

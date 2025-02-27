import { useState, useEffect } from "react";
import CourseCard from "../Courses/CourseCard";
import { getEnrollCoursesFromIds } from "@/actions/getEnrollCourses";
import useSweetAlert from "@/hooks/useSweetAlert";

const EnrolledContent = ({ enrolled_courses }) => {
	const [loading, setLoading] = useState(false);
	const [Courses, setCourses] = useState([]);
	const showAlert = useSweetAlert();

	// console.log("Enrolled Courses provided:Courses", enrolled_courses);

	// Fetch enrolled Courses details
	useEffect(() => {
		const fetchCourses = async () => {
			if (!enrolled_courses?.length) {
				console.warn("No enrolled Courses provided.");
				return;
			}

			setLoading(true);

			try {
				// console.log("Fetching course details for:", enrolled_courses);
				const courseDetails = await getEnrollCoursesFromIds(
					enrolled_courses
				);
				// console.log("Fetched course details:", courseDetails);

				setCourses(courseDetails);
			} catch (err) {
				console.error("Failed to fetch Courses:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [enrolled_courses]);

	if (loading) {
		return <p>Loading Courses...</p>;
	}

	if (!Courses.length) {
		return <p>No enrolled Courses found.</p>;
	}

	return Courses.map((course, idx) => (
		<CourseCard
			key={idx}
			course={course?.data}
			type={"primary"}
			enrolled_courses={enrolled_courses}
		/>
	));
};

export default EnrolledContent;

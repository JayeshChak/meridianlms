"use client";

import { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import AOS from "aos";
import "aos/dist/aos.css";

const FilterCards = ({ type }) => {
	const [Courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const filterOptions = [
		"filter1 filter3",
		"filter2 filter3",
		"filter4 filter5",
		"filter4",
		"filter1 filter3",
		"filter2 filter5",
		"filter4 filter5",
		"filter4",
	];

	// Filters the Courses based on the type and limits the number
	const displayedCourses =
		type === "lg" ? Courses.slice(0, 8) : Courses.slice(0, 6);

	// Fetch Courses on component mount
	useEffect(() => {
		const fetchCourses = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/Courses`);
				if (!response.ok) {
					throw new Error("Failed to fetch Courses");
				}
				const data = await response.json();
				console.log("Fetched Courses:", data.data); // Log fetched data
				setCourses(data.data || []); // Ensure data is an array
			} catch (err) {
				setError(err.message || "An unknown error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, []);

	// Initialize AOS
	useEffect(() => {
		AOS.init({
			duration: 1200, // Customize as needed
			once: true, // Whether animation should happen only once
		});
	}, []);

	// Refresh AOS when Courses are updated
	useEffect(() => {
		if (!loading && !error) {
			AOS.refresh();
		}
	}, [Courses, loading, error]);

	if (loading) {
		return <div>Loading Courses...</div>; // Simple loading state
	}

	if (error) {
		return <div>Error: {error}</div>; // Error handling
	}

	if (displayedCourses.length === 0) {
		return <div>No Courses available</div>; // Handle no Courses scenario
	}

	return (
		<div className="filter-contents flex flex-wrap sm:-mx-15px box-content mt-7 lg:mt-25px">
			{displayedCourses.map((course, idx) => (
				<CourseCard
					key={idx}
					idx={idx}
					type={type}
					course={{
						...course,
						filterOption: filterOptions[idx] || "default-filter", // Ensure filterOption exists
					}}
				/>
			))}
		</div>
	);
};

export default FilterCards;

// "use client";

// import { useEffect, useState } from "react";
// import CourseCard from "./CourseCard";

// const FilterCards = ({ type }) => {
//   const [Courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const filterOptions = [
//     "filter1 filter3",
//     "filter2 filter3",
//     "filter4 filter5",
//     "filter4",
//     "filter1 filter3",
//     "filter2 filter5",
//     "filter4 filter5",
//     "filter4",
//   ];

//   // Filters the Courses based on the type and limits the number
//   const displayedCourses = type === "lg" ? Courses.slice(0, 8) : Courses.slice(0, 6);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(`/api/Courses`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch Courses");
//         }
//         const data = await response.json();
//         console.log("Fetched Courses:", data.data); // Log fetched data
//         setCourses(data.data || []); // Ensure data is an array
//       } catch (err) {
//         setError(err.message || "An unknown error occurred");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourses();
//   }, []);

//   if (loading) {
//     return <div>Loading Courses...</div>; // Simple loading state
//   }

//   if (error) {
//     return <div>Error: {error}</div>; // Error handling
//   }

//   if (displayedCourses.length === 0) {
//     return <div>No Courses available</div>; // Handle no Courses scenario
//   }

//   return (
//     <div
//       className="filter-contents flex flex-wrap sm:-mx-15px box-content mt-7 lg:mt-25px"
//       data-aos="fade-up"
//     >
// {displayedCourses.map((course, idx) => (
//   <CourseCard
//     key={idx}
//     idx={idx}
//     type={type}
//     course={{
//       ...course,
//       filterOption: filterOptions[idx] || "default-filter", // Ensure filterOption exists
//     }}
//   />
// ))}
//     </div>
//   );
// };

// export default FilterCards;

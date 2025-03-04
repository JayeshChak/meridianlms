import React from "react";
import MobileAccordion from "./MobileAccordion";

const AccordionCourses2 = () => {
	const items = [
		{
			name: "Course",
			path: "/Courses",
		},
		{
			name: "Course (Dark)",
			path: "/Courses-dark",
		},
		{
			name: "Course List",
			path: "/course-list",
		},
		{
			name: "Course List (Dark)",
			path: "/course-list-dark",
		},
		{
			name: "Course Grid",
			path: "/course-grid",
		},
		{
			name: "Course Grid (Dark)",
			path: "/course-grid-dark",
		},
		{
			name: "Course-Details",
			path: "/Courses/1",
		},
		{
			name: "Details (Dark)",
			path: "/Courses-dark/1",
		},
		{
			name: "Details 2",
			path: "/course-details-2",
		},
		{
			name: "Details 2 (Dark)",
			path: "/course-details-2-dark",
		},
		{
			name: "Details 3",
			path: "/course-details-3",
		},
		{
			name: "Details 3 (Dark)",
			path: "/course-details-3-dark",
		},
	];
	return <MobileAccordion items={items} />;
};

export default AccordionCourses2;

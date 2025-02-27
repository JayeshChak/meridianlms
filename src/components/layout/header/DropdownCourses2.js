import React from "react";
import DropdownPrimary from "./DropdownPrimary";

const DropdownCourses2 = () => {
	const items = [
		{
			name: "Course",
			status: null,
			path: "/Courses",
			type: "secondary",
		},
		{
			name: "Course (Dark)",
			status: null,
			path: "/course-list",
			type: "secondary",
		},
		{
			name: "Course List",
			status: null,
			path: "/course-list",
			type: "secondary",
		},
		{
			name: "Course List (Dark)",
			status: null,
			path: "/course-list-dark",
			type: "secondary",
		},
		{
			name: "Course Grid",
			status: null,
			path: "/course-grid",
			type: "secondary",
		},
		{
			name: "Course Grid (Dark)",
			status: null,
			path: "/course-grid-dark",
			type: "secondary",
		},
		{
			name: "Course-Details",
			status: null,
			path: "/Courses/1",
			type: "secondary",
		},
		{
			name: "Details (Dark)",
			status: null,
			path: "/Courses-dark/1",
			type: "secondary",
		},
		{
			name: "Details 2",
			status: null,
			path: "/course-details-2",
			type: "secondary",
		},
		{
			name: "Details 2 (Dark)",
			status: null,
			path: "/course-details-2-dark",
			type: "secondary",
		},
		{
			name: "Details 3",
			status: null,
			path: "/course-details-3",
			type: "secondary",
		},
		{
			name: "Details 3 (Dark)",
			status: null,
			path: "/course-details-3-dark",
			type: "secondary",
		},
	];
	return <DropdownPrimary items={items} />;
};

export default DropdownCourses2;

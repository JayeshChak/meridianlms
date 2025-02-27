import CoursesPrimary from "@/components/sections/Courses/CoursesPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const CoursesMain = () => {
	return (
		<>
			<HeroPrimary path={"Courses"} title={"Featured Course"} />
			<CoursesPrimary card={true} />
		</>
	);
};

export default CoursesMain;

import CoursesPrimary from "@/components/sections/Courses/CoursesPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";

const CourseListMain = () => {
	return (
		<>
			<HeroPrimary path={"Courses List"} title={"Courses List"} />
			<CoursesPrimary isNotSidebar={true} isList={true} />
		</>
	);
};

export default CourseListMain;

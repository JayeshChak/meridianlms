import CoursesPrimary from "@/components/sections/Courses/CoursesPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";

const CourseGridMain = () => {
	return (
		<>
			<HeroPrimary path={"Courses Grid"} title={"Courses Grid"} />
			<CoursesPrimary isNotSidebar={true} />
		</>
	);
};

export default CourseGridMain;

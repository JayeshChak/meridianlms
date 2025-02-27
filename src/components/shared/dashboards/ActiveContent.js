import CourseCard from "../Courses/CourseCard";

const ActiveContent = ({ Courses }) => {
	return Courses?.map((course, idx) => (
		<CourseCard key={idx} course={course} type={"primary"} />
	));
};

export default ActiveContent;

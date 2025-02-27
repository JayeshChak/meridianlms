import CourseCard from "../Courses/CourseCard";

const PendingContent = ({ Courses }) => {
	return Courses?.map((course, idx) => (
		<CourseCard key={idx} course={course} type={"primary"} />
	));
};

export default PendingContent;

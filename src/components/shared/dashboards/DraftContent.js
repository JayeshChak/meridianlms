import CourseCard from "../Courses/CourseCard";

const DraftContent = ({ Courses }) => {
	return Courses?.map((course, idx) => (
		<CourseCard key={idx} course={course} type={"primary"} />
	));
};

export default DraftContent;

import CourseCard from "../Courses/CourseCard";
const PublishContent = ({ Courses }) => {
	return Courses?.map((course, idx) => (
		<CourseCard key={idx} course={course} type={"primary"} />
	));
};

export default PublishContent;

import getAllCourses from "@/libs/getAllCourses";
import CourseCard2 from "../Courses/CourseCard2";

const CourseContent = ({ isNotSidebar }) => {
	const allCourses = getAllCourses();
	const Courses = allCourses.slice(0, 3);

	return (
		<div className="flex flex-col gap-30px">
			{Courses?.length &&
				Courses.map((course, idx) => (
					<CourseCard2
						isNotSidebar={isNotSidebar}
						key={idx}
						idx={idx}
						course={course}
					/>
				))}
		</div>
	);
};

export default CourseContent;

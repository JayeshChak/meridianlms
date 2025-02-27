import CourseCard from "./CourseCard";

const NewCollectionContent = ({ Courses }) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg::grid-cols-3 xl:grid-cols-4 -mx-15px">
			{Courses?.length
				? Courses?.map((course, idx) => (
						<CourseCard
							key={idx}
							course={course}
							type={"primary"}
						/>
				  ))
				: ""}
		</div>
	);
};

export default NewCollectionContent;

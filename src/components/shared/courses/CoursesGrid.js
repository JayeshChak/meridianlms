import CourseCard from "./CourseCard";

const CoursesGrid = ({ Courses, isNotSidebar, enrolled_courses }) => {
	// console.log("Courses grid", enrolled_courses);
	return (
		<div
			className={`grid grid-cols-1 ${
				isNotSidebar
					? "sm:grid-cols-2 xl:grid-cols-3"
					: "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
			} gap-30px items-stretch auto-rows-[1fr]`}
		>
			{Courses?.length ? (
				Courses.map((course, idx) => (
					<CourseCard
						key={idx}
						course={course}
						type={"primaryMd"}
						enrolled_courses={enrolled_courses}
					/>
				))
			) : (
				<span>No Courses found.</span>
			)}
		</div>
	);
};

export default CoursesGrid;

// import CourseCard from "./CourseCard";

// const CoursesGrid = ({ Courses, isNotSidebar }) => {

//   console.log("Courses grid", Courses && Courses);
//   return (
//     <div
//       className={`grid grid-cols-1 ${isNotSidebar
//         ? "sm:grid-cols-2 xl:grid-cols-3"
//         : "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
//         }   gap-30px`}
//     >
//       {Courses?.length ? (
//         Courses?.map((course, idx) => (
//           <CourseCard key={idx} course={course} type={"primaryMd"} />
//         ))
//       ) : (
//         <span></span>
//       )}
//     </div>
//   );
// };

// export default CoursesGrid;

{
	/* <CourseCard key={idx} course={course} type={"primaryMd"} /> */
}

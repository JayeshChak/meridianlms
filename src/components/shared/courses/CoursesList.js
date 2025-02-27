import React from "react";
import CourseCard2 from "./CourseCard2";

const CoursesList = ({
	Courses,
	card,
	isList,
	isNotSidebar,
	enrolled_courses,
}) => {
	// console.log("Courses list", Courses && Courses);
	return (
		<div className="flex flex-col gap-30px">
			{Courses?.length > 0 ? (
				Courses.map((course, idx) => (
					<CourseCard2
						key={idx}
						course={course}
						isList={isList}
						card={card}
						isNotSidebar={isNotSidebar}
						enrolled_courses={enrolled_courses} // Pass enrolled_courses to CourseCard2
					/>
				))
			) : (
				<span>No Courses available</span>
			)}
		</div>
	);
};

export default CoursesList;

// import React from "react";
// import CourseCard2 from "./CourseCard2";

// const CoursesList = ({ Courses, card, isList, isNotSidebar,enrolled_courses }) => {
//   console.log("Courses list", Courses&&Courses);
//   return (
//     <div className="flex flex-col gap-30px">

//       {Courses?.length > 0 ? (
//         Courses?.map((course, idx) => (
//           <CourseCard2
//             key={idx}
//             course={course}
//             isList={isList}
//             card={card}
//             isNotSidebar={isNotSidebar}
//           />
//         ))
//       ) : (
//         <span>Not working</span>
//       )}
//     </div>
//   );
// };

// export default CoursesList;

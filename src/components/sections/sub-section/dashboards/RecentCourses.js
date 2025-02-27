"use client";
import { useEffect, useState } from "react";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";

const RecentCourses = () => {
	const [Courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch recent Courses from the API
		const fetchCourses = async () => {
			try {
				const response = await fetch("/api/dashboard/recentCourses");
				const data = await response.json();
				setCourses(data.Courses);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching recent Courses:", error);
				setLoading(false);
			}
		};

		fetchCourses();
	}, []);

	// if (loading) {
	//   return <p>Loading...</p>;
	// }

	return (
		<div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
			<HeadingDashboard path={"/Courses"}>
				Recent Courses
			</HeadingDashboard>
			{/* Courses */}
			<ul>
				{loading && <p>Loading...</p>}
				{Courses?.map(
					(
						{
							title,
							course_id,
							lesson,
							instructor_name,
							totalDuration,
							thumbnail,
						},
						idx
					) => (
						<li
							key={idx}
							className={`flex items-center flex-wrap  ${
								idx === Courses?.length - 1
									? "pt-5"
									: "py-5 border-b border-borderColor dark:border-borderColor-dark"
							}`}
						>
							{/* Thumbnail */}
							<div className="w-full md:w-30% md:pr-5">
								<Link
									className="w-full"
									href={`/Courses/${course_id}`}
								>
									<CldImage
										src={thumbnail || ""}
										alt={title || ""}
										className="w-card-img py-[3px]"
										width={200}
										height={120}
										sizes={"60w"}
									/>
								</Link>
							</div>
							{/* Details */}
							<div className="w-full md:w-70% md:pr-5">
								<div>
									<h5 className="text-lg leading-1.5 font-medium text-contentColor dark:text-contentColor-dark mb-5px">
										<Link
											className="hover:text-primaryColor"
											href={`/Courses/${course_id}`}
										>
											{title}
										</Link>
									</h5>
									<div className="flex flex-wrap items-center justify-between text-sm text-darkblack dark:text-darkblack-dark gap-x-15px gap-y-10px leading-1.8">
										<p>
											<i className="icofont-teacher"></i>{" "}
											{instructor_name}
										</p>
										<p>
											<i className="icofont-book-alt"></i>{" "}
											{lesson} Lessons
										</p>
										<p>
											<i className="icofont-clock-time"></i>{" "}
											{totalDuration} hours
										</p>
									</div>
								</div>
							</div>
						</li>
					)
				)}
			</ul>
		</div>
	);
};

export default RecentCourses;

// import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
// import Image from "next/image";
// import Link from "next/link";
// import getAllCourses from "@/libs/getAllCourses";
// const RecentCourses = () => {
//   const Courses = getAllCourses(0, 4);

//   return (
//     <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
//       <HeadingDashboard path={"/Courses"}>Recent Course</HeadingDashboard>
//       {/* instrutor */}
//       <ul>
//         {Courses?.map(
//           ({ title, id, lesson, instructor_name, duration, image }, idx) => (
//             <li
//               key={idx}
//               className={`flex items-center flex-wrap  ${
//                 idx === Courses?.length - 1
//                   ? "pt-5"
//                   : "py-5 border-b border-borderColor dark:border-borderColor-dark"
//               }`}
//             >
//               {/* avatar */}
//               <div className="w-full md:w-30% md:pr-5">
//                 <Link className="w-full" href={`/Courses/${id}`}>
//                   <Image
//                     src={image}
//                     alt=""
//                     className="w-full rounded"
//                     placeholder="blur"
//                   />
//                 </Link>
//               </div>
//               {/* details */}
//               <div className="w-full md:w-70% md:pr-5">
//                 <div>
//                   <h5 className="text-lg leading-1.5 font-medium text-contentColor dark:text-contentColor-dark mb-5px">
//                     <Link
//                       className="hover:text-primaryColor"
//                       href={`/Courses/${id}`}
//                     >
//                       {title}
//                     </Link>
//                   </h5>
//                   <div className="flex flex-wrap items-center justify-between text-sm text-darkblack dark:text-darkblack-dark gap-x-15px gap-y-10px leading-1.8">
//                     <p>
//                       <i className="icofont-teacher"></i> {instructor_name}
//                     </p>
//                     <p>
//                       <i className="icofont-book-alt"></i> {lesson}
//                     </p>
//                     <p>
//                       <i className="icofont-clock-time"></i> {duration}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </li>
//           )
//         )}
//       </ul>
//     </div>
//   );
// };

// export default RecentCourses;

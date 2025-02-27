import Link from "next/link";
import FeaturedSlider from "../featured-Courses/FeaturedSlider";

const InstrutorOtherCourses = ({ course_id }) => {
	return (
		<div className="mt-50px " data-aos="fade-up">
			{/* other Courses heading  */}
			<div className="flex items-center justify-between mb-10px">
				<h4 className="text-3xl font-bold text-blackColor dark:text-blackColor-dark leading-1.2">
					Author More Courses
				</h4>
				<Link
					href="/Courses"
					className="text-contentColor dark:text-contentColor-dark"
				>
					More Courses...
				</Link>
			</div>
			<div data-aos="fade-up" className="sm:-mx-15px">
				<FeaturedSlider course_id={course_id} />
			</div>
		</div>
	);
};

export default InstrutorOtherCourses;

import CourseDetailsMain from "@/components/layout/main/CourseDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Courses from "@/../public/fakedata/Courses.json";
import { notFound } from "next/navigation";
export const metadata = {
	title: "Courses Details - Dark | Meridian LMS - Education LMS Template",
	description:
		"Courses Details - Dark | Meridian LMS - Education LMS Template",
};
const Course_Details_Dark = ({ params }) => {
	const { id } = params;
	const isExistCourse = Courses?.find(({ id: id1 }) => id1 === parseInt(id));
	if (!isExistCourse) {
		notFound();
	}
	return (
		<PageWrapper>
			<main className="is-dark">
				<CourseDetailsMain />
				<ThemeController />
			</main>
		</PageWrapper>
	);
};
export async function generateStaticParams() {
	return Courses?.map(({ id }) => ({ id: id.toString() }));
}
export default Course_Details_Dark;

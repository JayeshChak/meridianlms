import InstructorMain from "@/components/layout/main/InstructorMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Instructor | Meridian LMS - Education LMS Template",
  description: "Instructor | Meridian LMS - Education LMS Template",
};
const Instructors = () => {
  return (
    <PageWrapper>
      <main>
        <InstructorMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Instructors;

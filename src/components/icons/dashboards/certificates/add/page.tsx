import InstructorDashbordMain from "@/components/layout/main/dashboards/InstructorDashbordMain";

import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import AddCertificate from "../_comp/AddCertificate";

export const metadata = {
  title: "Instructor Dashboard | Meridian LMS - Education LMS Certification",
  description: "Instructor Dashboard | Meridian LMS - Education LMS Certification",
};

function page() {
  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            {/* <InstructorDashbordMain /> */}
            <AddCertificate />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  )
}

export default page

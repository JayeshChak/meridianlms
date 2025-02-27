const {
	default: TiltWrapper,
} = require("@/components/shared/wrappers/TiltWrapper");
const { default: Image } = require("next/image");
import about10 from "@/assets/images/about/about_10.png";
import AppleImage from "@/components/shared/animaited-images/AppleImage";
import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import TriangleImage from "@/components/shared/animaited-images/TriangleImage";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HeadingXl from "@/components/shared/headings/HeadingXl";
import HreoName from "@/components/shared/section-names/HreoName";
const Hero3 = () => {
	return (
		<section data-aos="fade-up">
			{/* banner section */}
			<div className="bg-lightGrey11 dark:bg-lightGrey11-dark relative z-0 overflow-hidden py-30px md:py-60px lg:pt-40px lg:pb-50px 2xl:pt-60px 2xl:pb-80px">
				{/* animated icons */}
				<div>
					{/* <BookImage /> */}
					<GlobImage />
					{/* <BalbImage /> */}
					{/* <AppleImage /> */}
					<TriangleImage />
				</div>
				<div className="container 2xl:container-secondary-md relative overflow-hidden">
					<div className="grid grid-cols-1 lg:grid-cols-2 items-center">
						{/* banner Left */}
						<div data-aos="fade-up">
							<HreoName>EDUCATION SOLUTION</HreoName>
							<HeadingXl>
								Cloud-based LMS{" "}
								<br className="hidden md:block" />
								Trusted by 1000+
							</HeadingXl>
							<p className="text-size-15 md:text-lg text-blackColor dark:text-blackColor-dark font-medium mb-45px">
								Experience the power and flexibility of our
								cloud-based <br></br>
								Learning Management System (LMS), trusted by
								over 1,000 organizations globally.
							</p>

							<div className="space-x-5 md:space-x-30px">
								<ButtonPrimary path="/Courses">
									View Courses
								</ButtonPrimary>
								<ButtonPrimary
									color="secondary"
									path="/Courses"
								>
									Explore More
								</ButtonPrimary>
							</div>
						</div>
						{/* banner right */}
						<div data-aos="fade-up">
							<TiltWrapper>
								<div className="tilt">
									<Image
										className="w-full"
										src={about10}
										alt=""
										placeholder="blur"
									/>
								</div>
							</TiltWrapper>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero3;

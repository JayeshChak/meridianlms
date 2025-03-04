import Feature from "@/components/shared/features/Feature";
import React from "react";

const Features2 = () => {
	const features = [
		{
			title: "Video Training",
			desc: "With unlimited Courses",
		},
		{
			title: "Expert Teaceher",
			desc: "With unlimited Courses",
		},
		{
			title: "Versatile Course",
			desc: "With unlimited Courses",
		},
		{
			title: "Video Training",
			desc: "With unlimited Courses",
		},
	];
	return (
		<section>
			<div className="container-fluid-2">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-30px pb-20">
					{features.map((feature, idx) => (
						<Feature key={idx} feature={{ ...feature, id: idx }} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Features2;

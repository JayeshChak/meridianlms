"use client";
import React from "react";
import ClientComment from "@/components/shared/Blog-details/ClientComment";
import CommentFome from "@/components/shared/forms/CommentFome";

type Props = {
	commits: any;
	course_id: any;
};

const Commits: React.FC<Props> = ({ commits, course_id }) => {
	return (
		<div>
			{/* previous comment area  */}
			<ClientComment commits={commits} course_id={course_id} />
			{/* write comment area  */}
			<CommentFome course_id={course_id} />
		</div>
	);
};

export default Commits;

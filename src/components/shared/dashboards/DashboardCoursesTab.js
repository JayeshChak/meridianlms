"use client";
import React, { useEffect, useState } from "react";
import CourseTable from "./_comp/CourseTable";
import TabButtonSecondary from "../buttons/TabButtonSecondary";
import TabContentWrapper from "../wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";
import { useSession } from "next-auth/react";
import UserTableSkeleton from "./_comp/skeleton/UserTable";
import EmptyIcon from "./_comp/icons/EmptyIcon";

const DashboardCoursesTab = () => {
	const { currentIdx, handleTabClick } = useTab();
	const [Courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { data: session } = useSession();

	// Fetch instructor's Courses from the API
	useEffect(() => {
		const fetchCourses = async () => {
			if (!session?.User?.id) {
				setError("User is not authenticated.");
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/Courses/intructorCourses?instructorId=${session.User.id}`,
					{
						method: "GET",
					}
				);

				const data = await response.json();

				if (response.ok) {
					if (data.Courses && data.Courses.length > 0) {
						setCourses(data.Courses);
						setError(null);
					} else {
						setError("You have not created any Courses yet.");
						setCourses([]);
					}
				} else if (response.status === 404) {
					// No Courses found
					setError("You have not created any Courses yet.");
					setCourses([]);
				} else {
					setError(data.error || "Failed to fetch Courses.");
					setCourses([]);
				}
			} catch (err) {
				console.error("Error fetching Courses:", err);
				setError("An error occurred while fetching Courses.");
				setCourses([]);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [session?.User?.id]);

	// Filter Courses based on the status
	const publishedCourses = Courses?.filter((course) => course.is_published);
	const draftCourses = Courses?.filter((course) => !course.is_published);

	const tabButtons = [
		{
			name: "PUBLISHED",
			content: (
				<CourseTable
					Courses={publishedCourses}
					setCourses={setCourses}
				/>
			),
		},
		{
			name: "DRAFT",
			content: (
				<CourseTable Courses={draftCourses} setCourses={setCourses} />
			),
		},
	];

	return (
		<div className="p-6 md:p-10 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
			{/* Heading */}
			<div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
				<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
					Course Status
				</h2>
			</div>

			{/* Error or Empty State */}
			{!loading && error && (
				<div className="flex flex-col items-center text-center text-red-600 dark:text-red-400 mb-6">
					<EmptyIcon className="mb-4" size={50} />
					<p className="text-lg">{error}</p>
				</div>
			)}

			{/* Tabs and Content */}
			<div>
				{/* Tabs */}
				{Courses.length > 0 && (
					<div className="flex flex-wrap mb-4 md:mb-8 gap-2">
						{tabButtons.map(({ name }, idx) => (
							<TabButtonSecondary
								key={idx}
								name={name}
								idx={idx}
								currentIdx={currentIdx}
								handleTabClick={handleTabClick}
								buttonSize="small"
							/>
						))}
					</div>
				)}

				{/* Tab Content or Skeleton */}
				{loading ? (
					<UserTableSkeleton />
				) : Courses.length > 0 ? (
					<div>
						{tabButtons.map(({ content }, idx) => (
							<TabContentWrapper
								key={idx}
								isShow={idx === currentIdx}
							>
								{content}
							</TabContentWrapper>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default DashboardCoursesTab;

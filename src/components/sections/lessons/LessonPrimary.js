"use client";
import React, { useEffect, useState } from "react";
import LessonAccordion from "@/components/shared/lessons/LessonAccordion";
import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
import { useSession } from "next-auth/react";
import LessonRightSkeleton from "@/components/Loaders/LessonRightSkel";
import VideoPlayer from "./_comp/vedioPlayer";
import {
	fetchEnrolledCourses,
	fetchLessonById,
	fetchCourseByChapterId,
} from "@/actions/course";
import { convertLocalPathToUrl } from "@/actions/vedioPath";
import UserCourses from "./_comp/UserCourses";
import ProgressBannerSkeleton from "./_comp/ProgressBannerSkeleton";
import { BASE_URL } from "@/actions/constant";
import useSweetAlert from "@/hooks/useSweetAlert";
import EnrollButton from "./_comp/EnrollBtn";
import { useRouter } from "next/navigation";

import ProgressBar from "@/components/ProgressBar";

const LessonPrimary = ({ lessonId }) => {
	const { data: session } = useSession();
	const User = session?.User;
	const [lesson, setLesson] = useState(null);
	const [course, setCourse] = useState(null);
	const [enrolled_courses, setEnrolledCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isVideoVisible, setIsVideoVisible] = useState(true);
	const [isCompleted, setIsCompleted] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [completionError, setCompletionError] = useState(null);
	const showAlert = useSweetAlert();
	const router = useRouter();

	const [progressRefresh, setProgressRefresh] = useState(0);

	useEffect(() => {
		const loadLessonAndCourse = async () => {
			if (!lessonId || !User) {
				setError("Invalid lesson ID or User not logged in");
				setLoading(false);
				return;
			}

			try {
				const fetchedLesson = await fetchLessonById(lessonId);
				if (!fetchedLesson) throw new Error("Lesson not found");
				setLesson(fetchedLesson);

				const userEnrolledCourses = await fetchEnrolledCourses(User.id);
				setEnrolledCourses(userEnrolledCourses);

				const fetchedCourse = await fetchCourseByChapterId(
					fetchedLesson.chapter_id
				);
				if (!fetchedCourse) throw new Error("Course not found");
				setCourse(fetchedCourse);

				const enrolledCourse = userEnrolledCourses?.find(
					(c) => c.course_id === fetchedCourse.id
				);

				if (enrolledCourse && enrolledCourse.completedLectures) {
					const completedLesson =
						enrolledCourse.completedLectures.includes(lessonId);
					setIsCompleted(completedLesson);
				}
			} catch (err) {
				// Ensure that error is converted to a string for rendering
				const errorMessage =
					typeof err === "string"
						? err
						: err?.message || "Error loading lesson or course";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		loadLessonAndCourse();
	}, [lessonId, User, progressRefresh]);

	if (!session) {
		router.push("/login");
	}

	const handleMarkAsComplete = async () => {
		if (isCompleted || isSaving) return;

		setIsSaving(true);
		setCompletionError(null);

		const url = `${BASE_URL}/api/User/${User.id}/enrollCourses/markComplete`;

		const requestBody = {
			course_id: course.id,
			lectureId: lesson.id,
			isCompleted: true,
		};

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				throw new Error("Failed to mark lecture as complete");
			}

			const result = await response.json();
			console.log("Lecture marked as complete:", result);

			setEnrolledCourses((prev) => {
				const updatedCourses = prev.map((course) =>
					course.course_id === result.updatedEnrolledCourses.course_id
						? result.updatedEnrolledCourses
						: course
				);
				return updatedCourses;
			});

			showAlert("success", "Lecture completed successfully");
			setIsCompleted(true);

			// ✅ Refresh ProgressBar after update
			setProgressRefresh((prev) => prev + 1);
		} catch (error) {
			console.error("Error:", error);
			showAlert(
				"error",
				"Failed to mark the lesson as complete. Please try again."
			);
			setCompletionError(
				"Failed to mark the lesson as complete. Please try again."
			);
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) {
		return (
			<section>
				<div className="container-fluid-2 pt-12 pb-24">
					<div className="p-6 mb-8 bg-white rounded-lg shadow-md">
						<ProgressBannerSkeleton />
					</div>
					<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
						<div className="xl:col-start-1 xl:col-span-4">
							<AccordionSkeleton />
						</div>
						<div
							className="xl:col-start-5 xl:col-span-8 relative"
							data-aos="fade-up"
						>
							<LessonRightSkeleton />
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		// Ensure error is rendered as a string
		return <p className="text-red-500">{error.toString()}</p>;
	}

	if (!lesson || !course) {
		return (
			<p className="text-gray-500">No lesson or course data available.</p>
		);
	}

	const course_id = course.course_id || course.id;
	const courseCreatorId =
		course.creatorId || course.owner_id || course.createdBy;

	const isUserEnrolledInCourse = enrolled_courses.some(
		(enrolledCourse) => enrolledCourse.course_id === course_id
	);

	const isUserCourseCreator = User?.id === courseCreatorId;
	const isEnrolled = isUserEnrolledInCourse || isUserCourseCreator;
	const { video_url, title, is_locked, is_preview } = lesson;
	const videoUrlFormatted = convertLocalPathToUrl(video_url);

	return (
		<section>
			<div className="container-fluid-2 pt-12 pb-24">
				<div className="mb-8">
					<UserCourses
						currentCourseId={course_id}
						enrolled_courses={enrolled_courses}
						course={course}
					/>
				</div>

				{/* Integrate the ProgressBar here */}
				<div className="mb-8">
					<ProgressBar
						key={progressRefresh}
						course_id={course_id}
						refreshTrigger={progressRefresh}
					/>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
					<div
						className="xl:col-start-1 xl:col-span-4"
						data-aos="fade-up"
					>
						<LessonAccordion
							chapter_id={lesson.chapter_id}
							extra={course.extras}
							isEnrolled={isEnrolled}
							enrolled_courses={enrolled_courses}
							courseOwnerId={courseCreatorId}
						/>
					</div>

					<div
						className="xl:col-start-5 xl:col-span-8 relative"
						data-aos="fade-up"
					>
						<div className="absolute top-0 left-0 w-full flex justify-between items-center px-5 py-2 bg-primaryColor text-white z-10">
							<h3 className="text-lg font-bold">{title}</h3>
							<a
								href="/Courses"
								className="text-white hover:underline"
							>
								Close
							</a>
						</div>

						<div className="mt-16">
							{is_locked && !is_preview && !isEnrolled ? (
								<div className="flex items-center justify-center bg-black aspect-video">
									<div className="text-white text-center p-4">
										<p>
											This lesson is locked. Please enroll
											in the course to access it.
										</p>
									</div>
								</div>
							) : (
								<>
									{isVideoVisible ? (
										<VideoPlayer
											video_url={videoUrlFormatted}
											title={lesson.title}
											onComplete={handleMarkAsComplete}
											onClose={() =>
												setIsVideoVisible(false)
											} // Handle close action
										/>
									) : (
										<div className="flex items-center justify-center bg-black aspect-video">
											<p className="text-white">
												Video has been closed.
											</p>
										</div>
									)}

									{isCompleted && (
										<div className="h-1 w-full bg-green-500 my-4"></div>
									)}
									{completionError && (
										<p className="text-red-500">
											{completionError}
										</p>
									)}

									{isEnrolled ? (
										<button
											onClick={handleMarkAsComplete}
											className={`mt-4 px-4 py-2 ${
												isCompleted
													? "bg-gray-500"
													: "bg-green-500"
											} text-white rounded hover:bg-green-600`}
											disabled={isCompleted || isSaving}
										>
											{isSaving
												? "Processing..."
												: isCompleted
												? "✔ Completed"
												: "Mark as Complete"}
										</button>
									) : (
										<div className="pt-8 flex justify-center items-center  max-w-md  ">
											<EnrollButton
												currentCourseId={course_id}
												course={course}
											/>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default LessonPrimary;

// "use client";
// import React, { useEffect, useState } from "react";
// import LessonAccordion from "@/components/shared/lessons/LessonAccordion";
// import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
// import { useSession } from "next-auth/react";
// import LessonRightSkeleton from "@/components/Loaders/LessonRightSkel";
// import VideoPlayer from "./_comp/vedioPlayer";
// import { fetchEnrolledCourses, fetchLessonById, fetchCourseByChapterId } from "@/actions/course";
// import { convertLocalPathToUrl } from "@/actions/vedioPath";
// import UserCourses from "./_comp/UserCourses";
// import ProgressBannerSkeleton from "./_comp/ProgressBannerSkeleton";
// import { BASE_URL } from "@/actions/constant";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import EnrollButton from "./_comp/EnrollBtn";
// import { useRouter } from "next/navigation";

// const LessonPrimary = ({ lessonId }) => {
//   const { data: session } = useSession();
//   const User = session?.User;
//   const [lesson, setLesson] = useState(null);
//   const [course, setCourse] = useState(null);
//   const [enrolled_courses, setEnrolledCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isVideoVisible, setIsVideoVisible] = useState(true);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [completionError, setCompletionError] = useState(null);
//   const showAlert = useSweetAlert();
//   const router = useRouter();

//   useEffect(() => {
//     const loadLessonAndCourse = async () => {
//       if (!lessonId || !User) {
//         setError("Invalid lesson ID or User not logged in");
//         setLoading(false);
//         return;
//       }

//       try {
//         const fetchedLesson = await fetchLessonById(lessonId);
//         if (!fetchedLesson) throw new Error("Lesson not found");
//         setLesson(fetchedLesson);

//         const userEnrolledCourses = await fetchEnrolledCourses(User.id);
//         setEnrolledCourses(userEnrolledCourses);

//         const fetchedCourse = await fetchCourseByChapterId(fetchedLesson.chapter_id);
//         if (!fetchedCourse) throw new Error("Course not found");
//         setCourse(fetchedCourse);

//         const enrolledCourse = userEnrolledCourses.find((c) => c.course_id === fetchedCourse.id);
//         if (enrolledCourse && enrolledCourse.completedLectures) {
//           const completedLesson = enrolledCourse.completedLectures.includes(lessonId);
//           setIsCompleted(completedLesson);
//         }
//       } catch (err) {
//         const errorMessage = typeof err === "string" ? err : err?.message || "Error loading lesson or course";
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadLessonAndCourse();
//   }, [lessonId, User]);

//   if (!session) {
//     router.push("/login");
//   }

//   const handleMarkAsComplete = async () => {
//     if (isCompleted || isSaving) return;

//     setIsSaving(true);
//     setCompletionError(null);

//     const url = `${BASE_URL}/api/User/${User.id}/enrollCourses/markComplete`;

//     const requestBody = {
//       course_id: course.id,
//       lectureId: lesson.id,
//       isCompleted: true,
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to mark lecture as complete");
//       }

//       const result = await response.json();
//       console.log("Lecture marked as complete:", result);

//       setEnrolledCourses(prev => {
//         const updatedCourses = prev.map(course =>
//           course.course_id === result.updatedEnrolledCourses.course_id
//             ? result.updatedEnrolledCourses
//             : course
//         );
//         return updatedCourses;
//       });

//       showAlert("success", "Lecture completed successfully");
//       setIsCompleted(true);
//     } catch (error) {
//       console.error("Error:", error);
//       showAlert("error", "Failed to mark the lesson as complete. Please try again.");
//       setCompletionError("Failed to mark the lesson as complete. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <section>
//         <div className="container-fluid-2 pt-12 pb-24">
//           <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
//             <ProgressBannerSkeleton />
//           </div>
//           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//             <div className="xl:col-start-1 xl:col-span-4">
//               <AccordionSkeleton />
//             </div>
//             <div className="xl:col-start-5 xl:col-span-8 relative" data-aos="fade-up">
//               <LessonRightSkeleton />
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return <p className="text-red-500">{error}</p>;
//   }

//   if (!lesson || !course) {
//     return <p className="text-gray-500">No lesson or course data available.</p>;
//   }

//   const course_id = course.course_id || course.id;
//   const courseCreatorId = course.creatorId || course.owner_id || course.createdBy;

//   const isUserEnrolledInCourse = enrolled_courses.some(
//     (enrolledCourse) => enrolledCourse.course_id === course_id
//   );

//   const isUserCourseCreator = User?.id === courseCreatorId;
//   const isEnrolled = isUserEnrolledInCourse || isUserCourseCreator;
//   const { video_url, title, is_locked, is_preview } = lesson;
//   const videoUrlFormatted = convertLocalPathToUrl(video_url);

//   return (
//     <section>
//       <div className="container-fluid-2 pt-12 pb-24">
//         <div className="mb-8">
//           <UserCourses currentCourseId={course_id} enrolled_courses={enrolled_courses} course={course} />
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//           <div className="xl:col-start-1 xl:col-span-4" data-aos="fade-up">
//             <LessonAccordion
//               chapter_id={lesson.chapter_id}
//               extra={course.extras}
//               isEnrolled={isEnrolled}
//               enrolled_courses={enrolled_courses}
//               courseOwnerId={courseCreatorId}
//             />
//           </div>

//           <div className="xl:col-start-5 xl:col-span-8 relative" data-aos="fade-up">
//             <div className="absolute top-0 left-0 w-full flex justify-between items-center px-5 py-2 bg-primaryColor text-white z-10">
//               <h3 className="text-lg font-bold">{title}</h3>
//               <a href="/Courses" className="text-white hover:underline">Close</a>
//             </div>

//             <div className="mt-16">

//               {!is_locked && !is_preview && !isEnrolled ? (
//                 <div className="flex items-center justify-center bg-black aspect-video">
//                   <div className="text-white text-center p-4">
//                     <p>This lesson is locked. Please enroll in the course to access it.</p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {isVideoVisible ? (
//                     <VideoPlayer
//                       video_url={videoUrlFormatted}
//                       title={lesson.title}
//                       onComplete={handleMarkAsComplete}
//                       onClose={() => setIsVideoVisible(false)} // Handle close action
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center bg-black aspect-video">
//                       <p className="text-white">Video has been closed.</p>
//                     </div>
//                   )}

//                   {isCompleted && <div className="h-1 w-full bg-green-500 my-4"></div>}
//                   {completionError && <p className="text-red-500">{completionError}</p>}

//                 </>
//               )}
//                {
//                     isEnrolled ? (
//                       <button
//                         onClick={handleMarkAsComplete}
//                         className={`mt-4 px-4 py-2 ${isCompleted ? "bg-gray-500" : "bg-green-500"
//                           } text-white rounded hover:bg-green-600`}
//                         disabled={isCompleted || isSaving}
//                       >
//                         {isSaving ? "Processing..." : isCompleted ? "✔ Completed" : "Mark as Complete"}
//                       </button>
//                     ) : (
//                       <div className="pt-8 flex justify-center items-center  max-w-md  ">
//                         <EnrollButton currentCourseId={course_id} course={course} />
//                       </div>
//                     )
//                   }
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default LessonPrimary;

// "use client"
// import React, { useEffect, useState } from "react";
// import LessonAccordion from "@/components/shared/lessons/LessonAccordion";
// import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
// import { useSession } from "next-auth/react";
// import LessonRightSkeleton from "@/components/Loaders/LessonRightSkel";
// import VideoPlayer from "./_comp/vedioPlayer";
// import { fetchEnrolledCourses, fetchLessonById, fetchCourseByChapterId } from "@/actions/course";
// import { convertLocalPathToUrl } from "@/actions/vedioPath";
// import UserCourses from "./_comp/UserCourses";
// import ProgressBannerSkeleton from "./_comp/ProgressBannerSkeleton";
// import { BASE_URL } from "@/actions/constant";
// import useSweetAlert from "@/hooks/useSweetAlert";

// const LessonPrimary = ({ lessonId }) => {
//   const { data: session } = useSession();
//   const User = session?.User;
//   const [lesson, setLesson] = useState(null);
//   const [course, setCourse] = useState(null);
//   const [enrolled_courses, setEnrolledCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isVideoVisible, setIsVideoVisible] = useState(true);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [completionError, setCompletionError] = useState(null);
//   const showAlert = useSweetAlert();

//   useEffect(() => {
//     const loadLessonAndCourse = async () => {
//       if (!lessonId || !User) {
//         setError("Invalid lesson ID or User not logged in");
//         setLoading(false);
//         return;
//       }

//       try {
//         // Fetch lesson data
//         const fetchedLesson = await fetchLessonById(lessonId);
//         if (!fetchedLesson) throw new Error("Lesson not found");
//         setLesson(fetchedLesson);

//         // Fetch enrolled Courses
//         const userEnrolledCourses = await fetchEnrolledCourses(User.id);
//         setEnrolledCourses(userEnrolledCourses);

//         // Fetch course data based on chapter_id from the lesson
//         const fetchedCourse = await fetchCourseByChapterId(fetchedLesson.chapter_id);
//         if (!fetchedCourse) throw new Error("Course not found");
//         setCourse(fetchedCourse);

//         // Check if the lesson is already completed
//         const enrolledCourse = userEnrolledCourses.find((c) => c.course_id === fetchedCourse.id);
//         if (enrolledCourse) {
//           const completedLesson = enrolledCourse.completedLectures.includes(lessonId);
//           setIsCompleted(completedLesson); // Only mark as completed if it's already completed
//         }
//       } catch (err) {
//         const errorMessage = typeof err === "string" ? err : err?.message || "Error loading lesson or course";
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadLessonAndCourse();
//   }, [lessonId, User]);

//   const handleMarkAsComplete = async () => {
//     if (isCompleted || isSaving) return;

//     setIsSaving(true);
//     setCompletionError(null); // Reset any previous errors

//     const url = `${BASE_URL}/api/User/${User.id}/enrollCourses/markComplete`;

//     const requestBody = {
//       course_id: course.id,
//       lectureId: lesson.id,
//       isCompleted: true,
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to mark lecture as complete");
//       }

//       const result = await response.json();
//       console.log("Lecture marked as complete:", result);
//       showAlert("success", "Lecture completed successfully");
//       setIsCompleted(true); // Mark as completed
//     } catch (error) {
//       console.error("Error:", error);
//       showAlert("error", "Failed to mark the lesson as complete. Please try again.");
//       setCompletionError("Failed to mark the lesson as complete. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <section>
//         <div className="container-fluid-2 pt-12 pb-24">
//           <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
//             <ProgressBannerSkeleton />
//           </div>
//           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//             <div className="xl:col-start-1 xl:col-span-4">
//               <AccordionSkeleton />
//             </div>
//             <div className="xl:col-start-5 xl:col-span-8 relative" data-aos="fade-up">
//               <LessonRightSkeleton />
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return <p className="text-red-500">{error}</p>;
//   }

//   if (!lesson || !course) {
//     return <p className="text-gray-500">No lesson or course data available.</p>;
//   }

//   const course_id = course.course_id || course.id;
//   const courseCreatorId = course.creatorId || course.owner_id || course.createdBy;

//   const isUserEnrolledInCourse = enrolled_courses.some(
//     (enrolledCourse) => enrolledCourse.course_id === course_id
//   );

//   const isUserCourseCreator = User?.id === courseCreatorId;
//   const isEnrolled = isUserEnrolledInCourse || isUserCourseCreator;
//   const { video_url, title, is_locked, is_preview } = lesson;
//   const videoUrlFormatted = convertLocalPathToUrl(video_url);

//   return (
//     <section>
//       <div className="container-fluid-2 pt-12 pb-24">
//         <div className="mb-8">
//           <UserCourses currentCourseId={course_id} enrolled_courses={enrolled_courses} course={course} />
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//           <div className="xl:col-start-1 xl:col-span-4" data-aos="fade-up">
//             <LessonAccordion
//               chapter_id={lesson.chapter_id}
//               extra={course.extras}
//               isEnrolled={isEnrolled}
//               enrolled_courses={enrolled_courses}
//               courseOwnerId={courseCreatorId}
//             />
//           </div>

//           <div className="xl:col-start-5 xl:col-span-8 relative" data-aos="fade-up">
//             <div className="absolute top-0 left-0 w-full flex justify-between items-center px-5 py-2 bg-primaryColor text-white z-10">
//               <h3 className="text-lg font-bold">{title}</h3>
//               <a href="/Courses" className="text-white hover:underline">Close</a>
//             </div>

//             <div className="mt-16">
//               {is_locked && !is_preview && !isEnrolled ? (
//                 <div className="flex items-center justify-center bg-black aspect-video">
//                   <div className="text-white text-center p-4">
//                     <p>This lesson is locked. Please enroll in the course to access it.</p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {isVideoVisible ? (
//                     <VideoPlayer
//                       video_url={videoUrlFormatted}
//                       title={lesson.title}
//                       onComplete={handleMarkAsComplete}
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center bg-black aspect-video">
//                       <p className="text-white">Video has been closed.</p>
//                     </div>
//                   )}

//                   {isCompleted && <div className="h-1 w-full bg-green-500 my-4"></div>}
//                   {completionError && <p className="text-red-500">{completionError}</p>}

//                   <button
//                     onClick={handleMarkAsComplete}
//                     className={`mt-4 px-4 py-2 ${isCompleted ? "bg-gray-500" : "bg-green-500"
//                       } text-white rounded hover:bg-green-600`}
//                     disabled={isCompleted || isSaving}
//                   >
//                     {isSaving ? "Processing..." : isCompleted ? "✔ Completed" : "Mark as Complete"}
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default LessonPrimary;

// "use client";

// import React, { useEffect, useState } from "react";
// import LessonList from "./_comp/LessonList"; // Import the LessonList component
// import Extras from "./_comp/Extras";
// import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
// import { BASE_URL } from "@/actions/constant";

// import fetchCourseQuizzes from "@/utils/fetchCourseQuizzes"; /////////////////////////////////////////////////////////

// // Function to fetch Chapters by chapter_id
// const fetchChaptersByChapterId = async (chapter_id) => {
//   try {
//     const res = await fetch(`${BASE_URL}/api/Courses/Chapters/${chapter_id}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include", // Include credentials if needed
//     });
//     if (!res.ok) {
//       throw new Error("Failed to fetch Chapters");
//     }
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching Chapters:", error);
//     return null;
//   }
// };

// const LessonAccordion = ({
//   chapter_id,
//   course_id,
//   extra = null, // Default value if extra is not provided
//   isEnrolled = false,
//   courseOwnerId = "",
//   userRoles = [], // Default to empty array to prevent undefined errors
// }) => {
//   const [Chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(-1); // Initialize to -1 (no accordion open)
//   const [courseQuizzes, setCourseQuizzes] = useState([]); /////////////////////////////////////////////////////////

//   // Determine User roles
//   const isSuperAdmin = userRoles.includes("superAdmin");
//   const isInstructor = userRoles.includes("instructor");
//   const isCourseOwner = courseOwnerId !== "" && isInstructor;

//   // Determine if the User can access all lessons
//   const canAccessAll = isSuperAdmin || isEnrolled || isCourseOwner;

//   /////////////////////////////////////////////////////////

//   // Load Chapters
//   useEffect(() => {
//     const loadChapters = async () => {
//       setLoading(true);
//       const fetchedChapters = await fetchChaptersByChapterId(chapter_id);
//       if (fetchedChapters?.Chapters) {
//         setChapters(fetchedChapters.Chapters);
//       }
//       setLoading(false);
//     };

//     loadChapters();
//   }, [chapter_id]);

//   // Load Quizzes
//   useEffect(() => {
//     const loadQuizzes = async () => {
//       if (canAccessAll && course_id) {
//         const quizzes = await fetchCourseQuizzes(course_id);
//         if (quizzes) {
//           setCourseQuizzes(quizzes);
//         }
//       }
//     };

//     loadQuizzes();
//   }, [canAccessAll, course_id]);

//   // Toggle the active state of the accordion
//   const toggleAccordion = (index) => {
//     setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
//   };

//   // Determine if Extras should be displayed outside LessonList
//   const canAccessExtras = canAccessAll && extra;

//   if (loading) {
//     return (
//       <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//         <AccordionSkeleton />
//       </div>
//     );
//   }

//   if (!Chapters || Chapters.length === 0) {
//     return <p>No Chapters available.</p>;
//   }

//   // Define a unique index for "Course Materials"
//   const courseMaterialsIndex = Chapters.length;

//   return (
//     <div>
//       <ul className="accordion-container curriculum">
//         {Chapters.map((chapter, index) => (
//           <li
//             key={chapter.id}
//             className={`accordion mb-25px overflow-hidden ${
//               activeIndex === index ? "active" : ""
//             }`}
//           >
//             <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//               {/* Controller */}
//               <div>
//                 <button
//                   className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
//                   onClick={() => toggleAccordion(index)} // Handle accordion toggle
//                   aria-expanded={activeIndex === index}
//                   aria-controls={`chapter-content-${index}`}
//                 >
//                   <span>{chapter.title}</span>

//                   <svg
//                     className={`transition-all duration-500 ${
//                       activeIndex === index ? "rotate-180" : "rotate-0"
//                     }`}
//                     width="20"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 16 16"
//                     fill="#212529"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
//                     ></path>
//                   </svg>
//                 </button>
//               </div>

//               {/* Content */}
//               <div
//                 id={`chapter-content-${index}`}
//                 className={`accordion-content transition-all duration-500 ${
//                   activeIndex === index ? "max-h-screen" : "max-h-0"
//                 }`}
//                 style={{ overflow: "hidden" }}
//               >
//                 <div className="content-wrapper p-10px md:px-30px">
//                   <LessonList
//                     lessons={chapter.lessons}
//                     extras={extra}
//                     isEnrolled={isEnrolled}
//                     courseOwnerId={courseOwnerId}
//                   />
//                 </div>
//               </div>
//             </div>
//           </li>
//         ))}

//         {/* Course Quizzes Section */}
//         {canAccessAll && courseQuizzes.length > 0 && (
//           <li className="accordion mb-25px overflow-hidden">
//             <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//               <button
//                 className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
//                 onClick={() => toggleAccordion(Chapters.length + 1)}
//               >
//                 <span>Course Quizzes</span>
//                 <svg
//                   className={`transition-all duration-500 ${
//                     activeIndex === Chapters.length + 1 ? "rotate-180" : "rotate-0"
//                   }`}
//                   width="20"
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 16 16"
//                   fill="#212529"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
//                   ></path>
//                 </svg>
//               </button>

//               <div
//                 className={`accordion-content transition-all duration-500 ${
//                   activeIndex === Chapters.length + 1 ? "max-h-screen" : "max-h-0"
//                 }`}
//               >
//                 <div className="content-wrapper p-10px md:px-30px">
//                   {courseQuizzes.map((quiz) => (
//                     <div key={quiz.id} className="py-4 border-b last:border-b-0">
//                       <h3 className="text-lg font-semibold">{quiz.title}</h3>
//                       <p className="text-sm text-gray-600">{quiz.description}</p>
//                       <button
//                         className="bg-primaryColor text-whiteColor px-4 py-2 rounded hover:bg-primaryColor-dark transition-colors mt-2"
//                       >
//                         Start Quiz
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </li>
//         )}

//         {/* Course Materials */}
//         {canAccessExtras && (
//           <li
//             className={`accordion mb-25px overflow-hidden ${
//               activeIndex === courseMaterialsIndex ? "active" : ""
//             }`}
//           >
//             <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//               <div>
//                 <button
//                   className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
//                   onClick={() => toggleAccordion(courseMaterialsIndex)} // Handle accordion toggle
//                   aria-expanded={activeIndex === courseMaterialsIndex}
//                   aria-controls={`course-materials-content-${courseMaterialsIndex}`}
//                 >
//                   <span>Course Materials</span>
//                   <svg
//                     className={`transition-all duration-500 ${
//                       activeIndex === courseMaterialsIndex
//                         ? "rotate-180"
//                         : "rotate-0"
//                     }`}
//                     width="20"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 16 16"
//                     fill="#212529"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
//                     ></path>
//                   </svg>
//                 </button>
//               </div>
//               {/* Content */}
//               <div
//                 id={`course-materials-content-${courseMaterialsIndex}`}
//                 className={`accordion-content transition-all duration-500 ${
//                   activeIndex === courseMaterialsIndex
//                     ? "max-h-screen"
//                     : "max-h-0"
//                 }`}
//                 style={{ overflow: "hidden" }}
//               >
//                 <div className="content-wrapper p-10px md:px-30px">
//                   <div className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
//                     {/* Handle potential undefined access to Chapters */}
//                     {Chapters[0] && <Extras lessonId={Chapters[0].id} />}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </li>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default LessonAccordion;

// old version of above code

"use client";

import React, { useEffect, useState } from "react";
import LessonList from "./_comp/LessonList"; // Import the LessonList component
import Extras from "./_comp/Extras";
import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
import { BASE_URL } from "@/actions/constant";
import QuestionnaireQuiz from "@/components/shared/lessons/_comp/QuizModal";

// Function to fetch Chapters by chapter_id
const fetchChaptersByChapterId = async (chapter_id) => {
	try {
		const res = await fetch(
			`${BASE_URL}/api/Courses/Chapters/${chapter_id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Include credentials if needed
			}
		);
		if (!res.ok) {
			throw new Error("Failed to fetch Chapters");
		}
		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching Chapters:", error);
		return null;
	}
};

const LessonAccordion = ({
	chapter_id,
	extra = null, // Default value if extra is not provided
	isEnrolled = false,
	courseOwnerId = "",
	userRoles = [], // Default to empty array to prevent undefined errors
}) => {
	const [Chapters, setChapters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeIndex, setActiveIndex] = useState(-1); // Initialize to -1 (no accordion open)
	const [Questionnaires, setQuestionnaires] = useState({});

	const [activeQuiz, setActiveQuiz] = useState(null);
	const [courseQuizzes, setCourseQuizzes] = useState(null);
	const [questionnaire_id, setQuestionnaireId] = useState(null);
	const [showQuiz, setShowQuiz] = useState(false);

	// Determine User roles
	const isSuperAdmin = userRoles.includes("superAdmin");
	const isInstructor = userRoles.includes("instructor");
	const isCourseOwner = courseOwnerId !== "" && isInstructor;

	// Determine if the User can access all lessons
	const canAccessAll = isSuperAdmin || isEnrolled || isCourseOwner;

	useEffect(() => {
		const loadChaptersAndQuestionnaires = async () => {
			setLoading(true);
			console.log("Fetching Chapters for chapter_id:", chapter_id);

			const fetchedChapters = await fetchChaptersByChapterId(chapter_id);

			if (fetchedChapters?.Chapters) {
				setChapters(fetchedChapters.Chapters);
				// Collect questionnaire IDs
				const chapterQuestionnaires = fetchedChapters.Chapters.filter(
					(chapter) => chapter.questionnaire_id != null
				).map((chapter) => ({
					chapter_id: chapter.id,
					questionnaire_id: chapter.questionnaire_id,
				}));

				console.log("Questionnaire IDs found:", chapterQuestionnaires);

				if (chapterQuestionnaires.length > 0) {
					try {
						const quizPromises = chapterQuestionnaires.map(
							({ chapter_id, questionnaire_id }) =>
								// .filter(({ questionnaire_id }) => questionnaire_id !== null)
								fetch(
									`${BASE_URL}/api/Courses/Chapters/Lectures/Questionnaires/${questionnaire_id}`
								)
									.then((res) =>
										res.ok
											? res.json()
											: Promise.reject(
													`Failed to fetch quiz for chapter ${chapter_id}`
											  )
									)
									.then((quizData) => ({
										chapter_id,
										quizData,
									}))
						);

						const quizResults = await Promise.allSettled(
							quizPromises
						);
						const quizzes = {};
						quizResults.forEach((result) => {
							if (result.status === "fulfilled") {
								const { chapter_id, quizData } = result.value;
								quizzes[chapter_id] = {
									id: quizData.id,
									title: quizData.title,
									questions: quizData.questions,
									questionnaire_id: quizData.id,
								};
							} else {
								console.error(
									"Quiz fetch error:",
									result.reason
								);
							}
						});

						setQuestionnaires(quizzes);
					} catch (error) {
						console.error("Error fetching Questionnaires:", error);
					}
				}
			}

			setLoading(false);
		};

		loadChaptersAndQuestionnaires();
	}, [chapter_id]);

	const handleQuizStart = (quiz) => {
		const quizWindow = window.open("", "QuizPopup", "width=600,height=700");

		if (quizWindow) {
			quizWindow.document.write(`
        <html>
          <head>
            <title>${quiz.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .question { margin-bottom: 20px; }
              .options { margin-left: 20px; }
              .submit-btn { background: #007bff; color: white; padding: 10px; border: none; cursor: pointer; }
            </style>
          </head>
          <body>
            <h2>${quiz.title}</h2>
            ${quiz.questions
				.map((q, i) => {
					// Parse options (stored as a JSON string in the API response)
					let options = [];
					try {
						options = JSON.parse(q.options);
					} catch (error) {
						console.error(
							"Failed to parse options for question:",
							q.question,
							error
						);
					}

					return `
                <div class="question">
                  <p><strong>${i + 1}. ${q.question}</strong></p>
                  <div class="options">
                    ${options
						.map(
							(option) => `
                      <label>
                        <input type="radio" name="q${i}" value="${option}" /> ${option}
                      </label><br/>
                    `
						)
						.join("")}
                  </div>
                </div>
              `;
				})
				.join("")}
            <button class="submit-btn">Submit Quiz</button>
          </body>
        </html>
      `);
		}
	};

	if (loading) {
		return (
			<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
				<AccordionSkeleton />
			</div>
		);
	}

	if (!Chapters || Chapters.length === 0) {
		return <p>No Chapters available.</p>;
	}

	// const fetchCourseQuizzes = async () => {
	//   try {
	//     setLoading(true);
	//     console.log("Fetching course quizzes for chapter_id:", chapter_id);

	//     const response = await fetch(
	//       `${BASE_URL}/api/Courses/Chapters/Lectures/Questionnaires/${questionnaire_id}`
	//     );

	//     if (!response.ok) throw new Error("Failed to fetch quizzes");

	//     const data = await response.json();
	//     console.log("Course quiz data received:", data);

	//     if (data.success && data.data && data.data.questionnaire_id) {
	//       console.log(
	//         "Fetching questionnaire details for:",
	//         data.data.questionnaire_id
	//       );

	//       const quizResponse = await fetch(
	//         `${BASE_URL}/api/Courses/Chapters/Lectures/Questionnaires/${data.data.questionnaire_id}`
	//       );

	//       if (quizResponse.ok) {
	//         const quizData = await quizResponse.json();
	//         setCourseQuizzes([
	//           {
	//             id: quizData.id,
	//             title: quizData.title,
	//             description: quizData.description,
	//             questionnaire_id: data.data.questionnaire_id,
	//             chapter_id: data.data.chapter_id,
	//           },
	//         ]);
	//       } else {
	//         console.error("Failed to fetch quiz details:", quizResponse.status);
	//       }
	//     } else {
	//       console.warn("No questionnaire_id found for this chapter.");
	//     }
	//   } catch (error) {
	//     console.error("Error:", error);
	//   } finally {
	//     setLoading(false);
	//   }
	// };

	// Toggle the active state of the accordion
	const toggleAccordion = (index) => {
		setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
	};

	// Determine if Extras should be displayed outside LessonList
	const canAccessExtras = canAccessAll && extra;

	if (loading) {
		return (
			<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
				<AccordionSkeleton />
			</div>
		);
	}

	if (!Chapters || Chapters.length === 0) {
		return <p>No Chapters available.</p>;
	}

	// Define a unique index for "Course Materials"
	const courseMaterialsIndex = Chapters.length;

	// Add after courseMaterialsIndex definition
	const quizSectionIndex = courseMaterialsIndex + 1;

	// const QuizSection = ({ chapter, Questionnaires, onStartQuiz }) => {
	//   const quiz = Questionnaires[chapter.id];

	//   if (!quiz) return null;

	//   return (
	//     <div className="mt-4 border-t pt-4">
	//       <div className="flex justify-between items-center">
	//         <div>
	//           <h3 className="text-lg font-semibold">Chapter Quiz</h3>
	//           <p className="text-sm text-gray-600">{quiz.title}</p>
	//           <p className="text-xs text-gray-500">
	//             {quiz.questions?.length || 0} questions
	//           </p>
	//         </div>
	//         <button
	//           onClick={() => handleQuizStart(quiz.questionnaire_id)}
	//           className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-opacity-90"
	//         >
	//           Start Quiz This
	//         </button>
	//       </div>
	//     </div>
	//   );
	// };

	return (
		<div>
			<ul className="accordion-container curriculum">
				{Chapters.map((chapter, index) => (
					<li
						key={chapter.id}
						className={`accordion mb-25px overflow-hidden ${
							activeIndex === index ? "active" : ""
						}`}
					>
						<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
							{/* Controller */}
							<div>
								<button
									className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
									onClick={() => toggleAccordion(index)} // Handle accordion toggle
									aria-expanded={activeIndex === index}
									aria-controls={`chapter-content-${index}`}
								>
									<span>{chapter.title}</span>

									<svg
										className={`transition-all duration-500 ${
											activeIndex === index
												? "rotate-180"
												: "rotate-0"
										}`}
										width="20"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="#212529"
									>
										<path
											fillRule="evenodd"
											d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
										></path>
									</svg>
								</button>
							</div>

							{/* Content */}
							<div
								id={`chapter-content-${index}`}
								className={`accordion-content transition-all duration-500 ${
									activeIndex === index
										? "max-h-screen"
										: "max-h-0"
								}`}
								style={{ overflow: "hidden" }}
							>
								<div className="content-wrapper p-10px md:px-30px">
									<LessonList lessons={chapter.lessons} />

									{/* Quiz Button */}
									{Questionnaires[chapter.id] && (
										<div className="mt-4 border-t pt-4">
											<button
												onClick={() =>
													handleQuizStart(
														Questionnaires[
															chapter.id
														]
													)
												}
												className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-opacity-90"
											>
												Start Quiz This
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</li>
				))}

				{/* Course Materials */}
				{isEnrolled && (
					<li className="accordion mb-25px overflow-hidden">
						<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
							<button className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]">
								<span>Course Materials</span>
							</button>
							<div className="content-wrapper p-10px md:px-30px">
								<Extras lessonId={Chapters[0]?.id} />
							</div>
						</div>
					</li>
				)}
			</ul>
		</div>
	);
};

export default LessonAccordion;

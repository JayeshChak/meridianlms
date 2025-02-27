const { useCallback } = require("react");
const { useState } = require("react");

const useChapterEditing = (initialChapters) => {
	const [Chapters, setChapters] = useState(initialChapters);

	const toggleEditing = useCallback((index) => {
		setChapters((prevChapters) =>
			prevChapters.map((chapter, i) => ({
				...chapter,
				editing: i === index ? !chapter.editing : chapter.editing,
			}))
		);
	}, []);

	const addChapter = useCallback(() => {
		setChapters((prevChapters) => [
			...prevChapters,
			{
				id: prevChapters.length + 1,
				name: `Chapter ${prevChapters.length + 1}: New Chapter`,
				description: "",
				Lectures: [],
			},
		]);
	}, []);

	const removeChapter = useCallback((index) => {
		setChapters((prevChapters) =>
			prevChapters.filter((_, i) => i !== index)
		);
	}, []);

	const updateChapter = useCallback((index, updatedChapter) => {
		setChapters((prevChapters) => {
			const newChapters = [...prevChapters];
			newChapters[index] = updatedChapter;
			return newChapters;
		});
	}, []);

	const setInitialChapters = useCallback((Chapters) => {
		setChapters(Chapters);
	}, []);

	return {
		Chapters,
		toggleEditing,
		addChapter,
		removeChapter,
		updateChapter,
		setInitialChapters,
	};
};

export default useChapterEditing;

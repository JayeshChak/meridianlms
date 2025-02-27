"use client";
import React, { useState } from "react";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import VideoField from "./VideoField";
import useSweetAlert from "@/hooks/useSweetAlert";

interface LectureManagerProps {
	chapter_id: string;
	onSave: (lecture: any) => void;
}

const LectureManager: React.FC<LectureManagerProps> = ({
	chapter_id,
	onSave,
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [duration, setDuration] = useState("");
	const [videoPath, setVideoPath] = useState("");
	const [is_preview, setIsPreview] = useState(false);
	const showAlert = useSweetAlert();

	const handleSaveLecture = async () => {
		if (!title || !duration || !videoPath) {
			showAlert(
				"error",
				"Title, duration, and video are required fields."
			);
			return;
		}

		const newLecture = {
			chapter_id,
			title,
			description,
			duration,
			video_url: videoPath,
			is_preview,
		};

		try {
			const response = await fetch("/api/Courses/Lectures", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newLecture),
			});

			if (response.ok) {
				const result = await response.json();
				showAlert("success", "Lecture added successfully!");
				onSave(result.lecture); // Pass the created lecture back to the parent component
			} else {
				const errorData = await response.json();
				showAlert(
					"error",
					`Failed to add lecture: ${errorData.message}`
				);
			}
		} catch (error) {
			console.error("An error occurred:", error);
			showAlert("error", "An unexpected error occurred.");
		}
	};

	return (
		<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md mt-4">
			<h3 className="text-xl font-semibold mb-4">Add a New Lecture</h3>
			<div className="mb-4">
				<label className="block mb-2 font-semibold">
					Lecture Title
				</label>
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Enter lecture title"
				/>
			</div>
			<div className="mb-4">
				<label className="block mb-2 font-semibold">
					Lecture Description
				</label>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Enter lecture description"
				/>
			</div>
			<div className="mb-4">
				<label className="block mb-2 font-semibold">Duration</label>
				<input
					type="text"
					value={duration}
					onChange={(e) => setDuration(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Enter lecture duration (e.g., 20 minutes)"
				/>
			</div>
			<div className="mb-4">
				<label className="block mb-2 font-semibold">Preview</label>
				<select
					value={is_preview ? "Yes" : "No"}
					onChange={(e) => setIsPreview(e.target.value === "Yes")}
					className="w-full p-2 border border-gray-300 rounded-md"
				>
					<option value="No">No</option>
					<option value="Yes">Yes</option>
				</select>
			</div>
			<VideoField
				setVideoPath={setVideoPath}
				showAlert={showAlert}
				labelText="Lecture Video"
			/>
			<ButtonPrimary type="button" onClick={handleSaveLecture}>
				Save Lecture
			</ButtonPrimary>
		</div>
	);
};

export default LectureManager;

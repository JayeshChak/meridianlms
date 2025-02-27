"use client";
import React, { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import TabsButton from "./Tabs";
import DesignTab from "./DesignTab";
import useTab from "@/hooks/useTab";
import { usePathname } from "next/navigation";
import { fetchCertificateDetails } from "@/actions/Certification";
import { initialPlaceholders } from "@/assets/mock";
import type {
	CertificateData,
	CertificatePlaceHolders,
} from "@/types/certificates";
import Select, { MultiValue, SingleValue, ActionMeta } from "react-select";
import html2canvas from "html2canvas";
import { SettingsIcon, RefreshIcon, TestIcon } from "@/components/icons";
import Draggable from "react-draggable";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getCroppedImg } from "@/utils/cropImage";
import useSweetAlert from "@/hooks/useSweetAlert";
import DownloadIcon from "@/components/sections/create-course/_comp/Certificate/Icon/DownloadIcon";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

interface Metadata {
	course_name?: string;
	instructor?: string;
	course_duration?: string;
}

interface Certificate {
	id: string;
	certificate_data_url: string;
	description: string;
	unique_identifier: string;
	metadata?: Metadata;
}

interface ImageOption {
	value: string;
	label: string;
}

interface EditCertiFieldsProps {
	setDesignData: (data: any) => void;
}

// Utility function to convert label to key format
const convertLabelToKey = (label: string) => {
	return label
		.replace(/\s+/g, " ") // Remove extra spaces
		.trim() // Trim whitespace
		.replace(/^[0-9]+/, "") // Remove numbers at the start
		.replace(/[^a-zA-Z ]/g, "") // Remove special characters
		.split(" ")
		.map((word, index) =>
			index === 0
				? word.toLowerCase()
				: word.charAt(0).toUpperCase() + word.slice(1)
		)
		.join("");
};

const EditCertiFields: React.FC<EditCertiFieldsProps> = ({ setDesignData }) => {
	const { currentIdx, handleTabClick } = useTab();
	const pathname = usePathname();
	const certificate_id = pathname?.split("/").pop() || "";

	// States
	const [selectedImages, setSelectedImages] = useState<ImageOption[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [options, setOptions] = useState<ImageOption[]>([]);
	const [history, setHistory] = useState<any[]>([]);
	const [future, setFuture] = useState<any[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [instructorName, setInstructorName] = useState("");
	const [Placeholders, setPlaceholders] =
		useState<CertificatePlaceHolders[]>(initialPlaceholders);
	const [certificate_data_url, setCertificateData] =
		useState<CertificateData | null>(null);
	const [showOptions, setShowOptions] = useState(false);
	const [crop, setCrop] = useState<Crop>({
		unit: "%",
		x: 25,
		y: 25,
		width: 50,
		height: 50,
	});
	const [zoom, setZoom] = useState(1);
	const [showCropper, setShowCropper] = useState(false);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	const showAlert = useSweetAlert();

	// Create a debounced save function for placeholder positions
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const savePlaceholderPosition = useCallback(
		debounce(async (placeholderId, x, y) => {
			try {
				const response = await fetch(
					`/api/manageCertificates/${certificate_id}`,
					{
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id: placeholderId, x, y }),
					}
				);

				if (!response.ok)
					throw new Error("Failed to update placeholder position.");
			} catch (error) {
				console.error("Error saving placeholder position:", error);
			}
		}, 500), // ✅ Debounce for 500ms
		[certificate_id]
	);

	// Utility function to strip HTML tags
	const stripHtmlTags = (html: string) => {
		const doc = new DOMParser().parseFromString(html, "text/html");
		return doc.body.textContent || "";
	};

	// Handle selection changes
	const handleChange = (
		newValue: SingleValue<ImageOption>,
		actionMeta: ActionMeta<ImageOption>
	) => {
		if (newValue) {
			setSelectedImages([newValue]);
			setCertificateData({
				id: certificate_id,
				certificate_data_url: newValue.value,
				owner_id: "",
				is_published: false,
				unique_identifier: "",
				title: newValue.label,
				is_revocable: false,
				metadata: {
					course_name: "",
					instructor: "",
					course_duration: "",
				},
				created_at: "",
				updated_at: "",
			});
		} else {
			setSelectedImages([]);
			setCertificateData(null);
		}
	};

	// Fetch saved certificates
	const fetchImages = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/certificates/get-saved");

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (
				!data ||
				!data.certificates ||
				!Array.isArray(data.certificates)
			) {
				console.error("Invalid data format received from API:", data);
				throw new Error("Invalid data format received from API.");
			}

			const fetchedImages: ImageOption[] = data.certificates.map(
				(cert: Certificate) => ({
					value: cert.certificate_data_url,
					label: `${stripHtmlTags(
						cert.description ||
							`Certificate ${cert.unique_identifier}`
					)} - ${cert.metadata?.course_name || "No Course Name"}`,
				})
			);

			setOptions(fetchedImages);
		} catch (error: any) {
			console.error("Error fetching existing images:", error);
			setError(
				error.message ||
					"Failed to load certificates. Please try again later."
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchImages();
	}, [fetchImages]);

	// Your existing handlers
	const handleSaveCertificate = async () => {
		// ... your save logic ...
	};

	const handleUndo = () => {
		if (history.length > 0) {
			const previousState = history[history.length - 1];
			setFuture((prev) => [certificate_data_url, ...prev]);
			setDesignData(previousState);
			setHistory((prev) => prev.slice(0, prev.length - 1));
		}
	};

	const handleRedo = () => {
		if (future.length > 0) {
			const nextState = future[0];
			setHistory((prev) => [...prev, certificate_data_url]);
			setDesignData(nextState);
			setFuture((prev) => prev.slice(1));
		}
	};

	// Simple and working download handler
	const handleDownload = useCallback(async () => {
		const certificateElement = document.querySelector(
			".certificate-container"
		);
		if (!certificateElement) return;

		try {
			const canvas = await html2canvas(
				certificateElement as HTMLElement,
				{
					useCORS: true,
					allowTaint: true,
					backgroundColor: "#ffffff",
					scale: 2,
				}
			);

			const dataUrl = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.download = `certificate-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();

			// Show success alert
			showAlert("success", "Certificate downloaded successfully");
		} catch (error) {
			console.error("Error downloading certificate:", error);
			showAlert("error", "Failed to download certificate");
		}
	}, [showAlert]);

	// Add this function to handle crop completion
	const handleCropComplete = useCallback(
		(croppedImage: string) => {
			const newImages = [...selectedImages];
			newImages[0] = {
				...newImages[0],
				value: croppedImage,
			};
			setSelectedImages(newImages);
			setShowCropper(false);
		},
		[selectedImages]
	);

	// Add this function to handle crop
	const handleCrop = useCallback(() => {
		const image = document.querySelector(
			"img[data-crop-source]"
		) as HTMLImageElement;
		if (!image || !crop.width || !crop.height) {
			showAlert("error", "Please select an area to crop");
			return;
		}

		try {
			const canvas = document.createElement("canvas");
			const scaleX = image.naturalWidth / image.width;
			const scaleY = image.naturalHeight / image.height;

			canvas.width = crop.width;
			canvas.height = crop.height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				throw new Error("Failed to get canvas context");
			}

			// Create a new image with crossOrigin set
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				ctx.drawImage(
					img,
					crop.x * scaleX,
					crop.y * scaleY,
					crop.width * scaleX,
					crop.height * scaleY,
					0,
					0,
					crop.width,
					crop.height
				);

				try {
					const croppedImageData = canvas.toDataURL("image/png");
					handleCropComplete(croppedImageData);
					showAlert("success", "Image cropped successfully");
				} catch (error) {
					console.error("Error converting to data URL:", error);
					showAlert("error", "Failed to process cropped image");
				}
			};

			img.onerror = () => {
				showAlert("error", "Failed to load image for cropping");
			};

			img.src = image.src;
		} catch (error) {
			console.error("Error cropping image:", error);
			showAlert("error", "Failed to crop image");
		}
	}, [crop, handleCropComplete, showAlert]);

	// Add this function to handle saving the certificate
	const handleSaveChanges = async () => {
		setLoading(true);
		try {
			if (!certificate_data_url) {
				throw new Error("Certificate data is missing");
			}

			if (
				!certificate_data_url.id ||
				certificate_data_url.id.trim() === ""
			) {
				throw new Error("Certificate ID is missing or empty");
			}

			console.log(
				"Certificate data before saving:",
				certificate_data_url
			);

			const isValidUUID = (uuid: string) => {
				const uuidRegex =
					/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				return uuidRegex.test(uuid);
			};

			if (!isValidUUID(certificate_data_url.id)) {
				console.error(
					"Invalid certificate ID:",
					certificate_data_url.id
				);
				throw new Error(
					`Invalid certificate ID: ${certificate_data_url.id}`
				);
			}

			// ✅ Ensure Placeholders retain their original IDs // ! warning i added this line
			const updatedPlaceholders = Placeholders.map((p) => ({
				id: isValidUUID(p.id || "") ? p.id : uuidv4(), // Keep existing UUIDs
				key: p.key ? p.key : convertLabelToKey(p.label || ""), // Provide default value for label
				label: p.label,
				value: p.value,
				x: p.x, // Ensure X position is stored
				y: p.y, // Ensure Y position is stored
				font_size: p.font_size,
				is_visible: p.is_visible,
				color: p.color,
			}));

			const payload = {
				id: certificate_data_url.id,
				image: selectedImages[0]?.value, // Include the certificate image
				Placeholders: updatedPlaceholders,
			};

			console.log("Payload for saving certificate:", payload);

			const response = await fetch(
				`/api/manageCertificates/${certificate_data_url.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to update certificate"
				);
			}

			const result = await response.json();
			console.log("Certificate updated successfully:", result);

			// Update local state or perform any other necessary actions
			setDesignData(result.data);
			showAlert("success", "Certificate updated successfully");
		} catch (error) {
			console.error("Error in handleSaveChanges:", error);
			showAlert(
				"error",
				error instanceof Error
					? error.message
					: "An unknown error occurred"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4">
			{/* Certificate Selection */}
			<div className="mb-4">
				<Select<ImageOption, false>
					options={options}
					value={selectedImages[0] || null}
					onChange={handleChange}
					isLoading={loading}
					placeholder="Select a certificate..."
					className="react-select-container"
					classNamePrefix="react-select"
					noOptionsMessage={() =>
						loading
							? "Loading certificates..."
							: "No certificates available"
					}
					isSearchable
				/>
			</div>

			{selectedImages.length > 0 && (
				<div className="mb-6">
					{/* Control Buttons */}
					<div className="flex space-x-4 mb-4">
						<button
							onClick={() => setShowOptions(!showOptions)}
							className="flex items-center space-x-2 bg-blue text-white px-4 py-2 rounded-lg"
						>
							<SettingsIcon size={24} color="white" />
							<span>Options</span>
						</button>
						<button
							onClick={() => setPlaceholders(initialPlaceholders)}
							className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg"
						>
							<RefreshIcon size={24} color="white" />
							<span>Reset</span>
						</button>
						<button
							onClick={handleSaveChanges}
							className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg"
						>
							<TestIcon size={24} color="white" />
							<span>Save Changes</span>
						</button>
						<button
							onClick={handleDownload}
							className="flex items-center space-x-2 bg-yellow text-white px-4 py-2 rounded-lg"
						>
							<DownloadIcon width={24} color="white" />
							<span>Download</span>
						</button>
					</div>

					{/* Add this options panel right after the buttons */}
					{showOptions && (
						<div className="mb-4 p-4 border rounded bg-gray-100">
							<h3 className="text-lg font-bold mb-4">
								Placeholder Settings
							</h3>
							{Array.isArray(Placeholders) &&
							Placeholders.length > 0 ? (
								<>
									<Select
										isMulti
										options={Placeholders.map((p) => ({
											value: p.id,
											label: p.label,
										}))}
										value={Placeholders.filter(
											(p) => p.is_visible
										).map((p) => ({
											value: p.id,
											label: p.label,
										}))}
										onChange={(selected) => {
											const selectedIds =
												selected?.map(
													(option) => option.value
												) || [];
											setPlaceholders((prev) =>
												prev.map((p) => ({
													...p,
													is_visible:
														selectedIds.includes(
															p.id
														),
												}))
											);
										}}
										className="mb-4"
									/>
									{Placeholders.map((placeholder) => (
										<div
											key={placeholder.id}
											className="mb-2 flex items-center justify-between"
										>
											<span>{placeholder.label}</span>
											<div className="flex items-center space-x-2">
												<label className="text-sm">
													Font Size:
												</label>
												<input
													type="number"
													value={
														placeholder.font_size ||
														16
													}
													onChange={(e) => {
														const size = Math.max(
															8,
															Math.min(
																72,
																parseInt(
																	e.target
																		.value
																) || 16
															)
														);
														setPlaceholders(
															(prev) =>
																prev.map((p) =>
																	p.id ===
																	placeholder.id
																		? {
																				...p,
																				font_size:
																					size,
																		  }
																		: p
																)
														);
													}}
													className="w-16 px-2 py-1 border rounded"
													min="8"
													max="72"
												/>
											</div>
										</div>
									))}
								</>
							) : (
								<p>No Placeholders available</p>
							)}
						</div>
					)}

					{/* Add crop button */}
					<button
						onClick={() => setShowCropper(true)}
						className="mb-4 px-4 py-2 bg-blue-500 text-green-500 rounded hover:bg-blue-600"
					>
						Crop Certificate
					</button>

					{showCropper ? (
						<div className="fixed inset-0 z-50 bg-white p-4">
							<div className="max-w-4xl mx-auto">
								<ReactCrop
									crop={crop}
									onChange={(c) => setCrop(c)}
									aspect={842 / 595}
								>
									<Image
										data-crop-source
										src={selectedImages[0].value}
										className="max-w-full"
										alt={selectedImages[0].label}
										layout="fill"
										objectFit="contain"
										crossOrigin="anonymous"
									/>
								</ReactCrop>

								<div className="mt-4 flex justify-end gap-2">
									<button
										onClick={() => setShowCropper(false)}
										className="px-4 py-2 bg-gray-500 text-white rounded"
									>
										Cancel
									</button>
									<button
										onClick={handleCrop}
										className="px-4 py-2 bg-blue text-white rounded"
									>
										Apply Crop
									</button>
								</div>
							</div>
						</div>
					) : (
						<div className="certificate-container relative w-[842px] h-[595px] mx-auto bg-white">
							<Image
								src={selectedImages[0].value}
								alt={selectedImages[0].label}
								className="w-full h-full object-contain"
								layout="fill"
								objectFit="contain"
								crossOrigin="anonymous"
							/>
							{/* Editable Placeholders */}
							<div className="absolute inset-0 p-8">
								{Array.isArray(Placeholders) &&
									Placeholders.map(
										(placeholder, index) =>
											placeholder &&
											placeholder.is_visible && (
												<Draggable
													key={placeholder.id}
													defaultPosition={{
														x: placeholder.x ?? 0,
														y: placeholder.y ?? 0,
													}}
													bounds="parent"
													onStop={(e, data) => {
														setPlaceholders(
															(prev) =>
																prev.map((p) =>
																	p.id ===
																	placeholder.id
																		? {
																				...p,
																				x: data.x,
																				y: data.y,
																		  }
																		: p
																)
														);
														savePlaceholderPosition(
															placeholder.id,
															data.x,
															data.y
														); // ✅ Debounced API call
													}}

													//! warning edited above
												>
													<div className="absolute cursor-move group">
														<input
															type="text"
															value={
																placeholder.value ||
																""
															}
															onChange={(e) => {
																const newPlaceholders =
																	[
																		...Placeholders,
																	];
																newPlaceholders[
																	index
																] = {
																	...placeholder,
																	value: e
																		.target
																		.value,
																};
																setPlaceholders(
																	newPlaceholders
																);
															}}
															className="bg-transparent hover:bg-white/50 focus:bg-white/50 
                     border border-transparent hover:border-gray-300 
                     focus:border-blue-500 rounded px-2 py-1 outline-none transition-all"
															style={{
																fontSize: `${
																	placeholder.font_size ||
																	16
																}px`,
																minWidth:
																	"100px",
															}}
															placeholder={
																placeholder.label ||
																""
															}
														/>
													</div>
												</Draggable>
											)
									)}
							</div>
						</div>
					)}

					{/* Save Changes Button */}
					<div className="flex justify-center mt-4">
						<button
							onClick={handleSaveChanges}
							className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
						>
							Save Changes
						</button>
					</div>
				</div>
			)}

			{/* DesignTab remains for other functionality */}
			<div className="mt-4">
				{currentIdx === 0 && (
					<DesignTab
						certificate_data_url={
							certificate_data_url || {
								id: certificate_id,
								owner_id: "",
								certificate_data_url: "",
								is_published: false,
								unique_identifier: "",
								title: "",
								is_revocable: false,
								metadata: {
									course_name: "",
									instructor: "",
									course_duration: "",
								},
								created_at: "",
								updated_at: "",
							}
						}
						isEditing={isEditing}
						instructorName={instructorName}
						setDesignData={setDesignData}
						Placeholders={Placeholders}
						setPlaceholders={setPlaceholders}
					/>
				)}
			</div>
		</div>
	);
};

export default EditCertiFields;

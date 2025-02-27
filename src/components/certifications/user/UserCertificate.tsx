// src/components/UserCertificate.tsx

import React, { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { TextElement, ImageElement } from "@/types/type";
import DraggableText from "../DraggableText"; // Adjusted import path
import DraggableImage from "../DraggableImage"; // Adjusted import path
import { replacePlaceholders } from "@/utils/replacePlaceholders";

interface UserCertificateProps {
	certificate_id: string; // The ID of the certificate template
	userData: {
		name: string;
		course: string;
		date: string;
		achievement?: string;
	}; // User-specific data for Placeholders
}

const UserCertificate: React.FC<UserCertificateProps> = ({
	certificate_id,
	userData,
}) => {
	const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
	const [texts, setTexts] = useState<TextElement[]>([]);
	const [images, setImages] = useState<ImageElement[]>([]);

	useEffect(() => {
		const fetchCertificate = async () => {
			try {
				const response = await fetch(
					`/api/certificates/${certificate_id}`
				);
				const data = await response.json();

				if (response.ok) {
					setBackgroundImage(data.backgroundImage || null);
					setTexts(data.texts || []);
					setImages(data.images || []);
				} else {
					console.error("Failed to fetch certificate:", data.message);
				}
			} catch (error) {
				console.error("Error fetching certificate:", error);
			}
		};

		fetchCertificate();
	}, [certificate_id]);

	const getReplacedText = (text: string): string => {
		return replacePlaceholders(text, userData);
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<Stage width={800} height={600} className="border">
				<Layer>
					{backgroundImage && (
						<DraggableImage
							image={{
								id: "background",
								src: backgroundImage,
								x: 0,
								y: 0,
								width: 800,
								height: 600,
							}}
							isSelected={false}
							onSelect={() => {}}
							setImages={() => {}}
							images={images}
							containerWidth={800}
							containerHeight={600}
						/>
					)}
					{images.map((image) => (
						<DraggableImage
							key={image.id}
							image={image}
							isSelected={false}
							onSelect={() => {}}
							setImages={() => {}}
							images={images}
							containerWidth={800}
							containerHeight={600}
						/>
					))}
					{texts.map((text) => (
						<DraggableText
							key={text.id}
							text={{ ...text, text: getReplacedText(text.text) }}
							isSelected={false}
							onSelect={() => {}}
							setTexts={() => {}}
							texts={texts}
						/>
					))}
				</Layer>
			</Stage>
		</div>
	);
};

export default UserCertificate;

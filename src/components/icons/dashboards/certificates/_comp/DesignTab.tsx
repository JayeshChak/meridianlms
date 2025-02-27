"use client";
import React, { useState } from "react";
import { SettingsIcon, RefreshIcon, TestIcon } from "@/components/icons";
import Select from "react-select";
import { initialPlaceholders } from "@/assets/mock";
import type {
	CertificateData,
	CertificatePlaceHolders,
} from "@/types/certificates";

interface Props {
	certificate_data_url: CertificateData;
	isEditing: boolean;
	instructorName: string;
	setDesignData: (data: any) => void;
	Placeholders: CertificatePlaceHolders[];
	setPlaceholders: React.Dispatch<
		React.SetStateAction<CertificatePlaceHolders[]>
	>;
}

const DesignTab: React.FC<Props> = ({
	certificate_data_url,
	isEditing,
	instructorName,
	setDesignData,
	Placeholders,
	setPlaceholders,
}) => {
	const [showOptions, setShowOptions] = useState(false);

	return (
		<div className="p-4">
			{/* Options panel */}
			{showOptions && (
				<div className="mb-4 p-4 border rounded bg-gray-100">
					<h3 className="text-lg font-bold mb-4">
						Placeholder Settings
					</h3>
					<Select
						isMulti
						options={Placeholders.map((p) => ({
							value: p.id,
							label: p.label,
						}))}
						value={Placeholders.filter((p) => p.is_visible).map(
							(p) => ({ value: p.id, label: p.label })
						)}
						onChange={(selected) => {
							const selectedIds = selected.map(
								(option) => option.value
							);
							setPlaceholders((prev) =>
								prev.map((p) => ({
									...p,
									is_visible: selectedIds.includes(p.id),
								}))
							);
						}}
						className="mb-4"
					/>
				</div>
			)}
		</div>
	);
};

export default DesignTab;

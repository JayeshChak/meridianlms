import type { CertificatePlaceHolders } from "@/types/certificates";
import { BASE_URL } from "./constant";
import { getErrorMessage } from "@/utils/errorUtils"; // Import the error handling utility

export const fetchCertificateDetails = async (
	certificate_id: string
): Promise<any> => {
	try {
		const response = await fetch(`/api/certificates/${certificate_id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error(getErrorMessage("FETCH_FAILED"));
		}

		const data = await response.json();
		return data;
	} catch (err) {
		console.error("Error fetching certificate:", err);
		throw new Error(getErrorMessage("NETWORK_ERROR"));
	}
};
// ###################################################################################
// *************************| Certification PlaceHolders |****************************
// ###################################################################################
export const savePlaceholders = async (
	Placeholders: CertificatePlaceHolders[],
	certificate_id: string
): Promise<boolean> => {
	try {
		const response = await fetch(
			`/api/certificates/${certificate_id}/Placeholders`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ Placeholders }),
			}
		);

		if (!response.ok) {
			throw new Error(getErrorMessage("SAVE_FAILED"));
		}

		console.log("Placeholders saved successfully");
		return true;
	} catch (error) {
		console.error("Error saving Placeholders:", error);
		return false;
	}
};

export const fetchPlaceholders = async (
	certificate_id: string
): Promise<CertificatePlaceHolders[]> => {
	try {
		const res = await fetch(
			`/api/certificates/${certificate_id}/Placeholders`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);

		if (!res.ok) {
			throw new Error(getErrorMessage("FETCH_FAILED"));
		}

		const data = await res.json();
		return data.Placeholders || [];
	} catch (error) {
		console.error("Error fetching Placeholders:", error);
		throw new Error(getErrorMessage("NETWORK_ERROR"));
	}
};

export const fetchCertificates = async (user_id: string) => {
	const response = await fetch(`/api/certificates?user_id=${user_id}`);
	if (!response.ok) {
		throw new Error("Failed to fetch certificates");
	}
	return await response.json(); // Adjust based on your API response structure
};

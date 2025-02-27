// src/app/actions/fetchUserDetailsFromApi.ts
export async function fetchUserDetailsFromApi(user_id: string) {
	try {
		const response = await fetch(`/api/User/${user_id}`, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch User details: ${response.statusText}`
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error in fetchUserDetailsFromApi:", error);
		throw error;
	}
}

export async function changeProfileImage(user_id: string, image: string) {
	try {
		if (user_id && image) {
			const res = await fetch(`/api/User/${user_id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					image,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message);
			}
			return data;
		}

		return null;
	} catch (error) {
		console.error("Error in changeProfileImage:", error);
		throw error;
	}
}

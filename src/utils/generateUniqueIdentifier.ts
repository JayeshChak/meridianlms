// utils/generateUniqueIdentifier.ts
import { db } from "@/db";
import { User } from "@/db/schemas/User";
import { desc, eq, like } from "drizzle-orm";
const MAX_RETRIES = 5; // Maximum number of attempts to generate a unique identifier

/**
 * Generates a unique identifier based on the User's role.
 * Format: PREFIX-YEAR-SEQUENCE (e.g., INS-2023-00001)
 *
 * @param role - The role of the User ('instructor', 'admin', or default 'User')
 * @returns A unique identifier string
 */
export async function generateUniqueIdentifier(role: string): Promise<string> {
	let unique_identifier = "";
	let attempts = 0;

	while (attempts < MAX_RETRIES) {
		attempts += 1;

		// Determine the prefix based on the role
		const prefix =
			role === "instructor" ? "INS" : role === "admin" ? "ADM" : "STU";
		const currentYear = new Date().getFullYear();
		const sequenceNumber = await getNextSequenceNumber(prefix, currentYear);

		unique_identifier = `${prefix}-${currentYear}-${String(
			sequenceNumber
		).padStart(5, "0")}`;

		try {
			// Attempt to insert a placeholder or use a transaction to reserve the unique_identifier
			// This step depends on your application's specific requirements and database setup
			// For simplicity, we'll check for uniqueness before returning

			// Check if the identifier is unique in the database
			const existingUser = await db
				.select()
				.from(User)
				.where(eq(User.unique_identifier, unique_identifier))
				.then((res) => res[0]);

			if (!existingUser) {
				// Unique identifier found
				return unique_identifier;
			}
		} catch (error) {
			console.error(`Error checking unique_identifier: ${error}`);
			throw new Error("Failed to generate unique identifier.");
		}
	}

	throw new Error(
		"Unable to generate a unique identifier after multiple attempts."
	);
}

/**
 * Retrieves the next sequence number for a given prefix and year.
 *
 * @param prefix - The prefix based on the User's role
 * @param year - The current year
 * @returns The next sequence number as a number
 */
async function getNextSequenceNumber(
	prefix: string,
	year: number
): Promise<number> {
	try {
		// Define the pattern for the unique_identifier
		const pattern = `${prefix}-${year}-%`;

		// Fetch the latest User with the given prefix and year
		const latestUser = await db
			.select()
			.from(User)
			.where(like(User.unique_identifier, pattern))
			.orderBy(desc(User.unique_identifier))
			.limit(1)
			.then((res) => res[0]);

		if (latestUser && latestUser.unique_identifier) {
			const parts = latestUser.unique_identifier.split("-");
			const lastSequence = parseInt(parts[2], 10);
			if (!isNaN(lastSequence)) {
				return lastSequence + 1;
			}
		}

		return 1; // Start from 1 if no users found or parsing failed
	} catch (error) {
		console.error(`Error fetching latest sequence number: ${error}`);
		throw new Error("Failed to retrieve the next sequence number.");
	}
}

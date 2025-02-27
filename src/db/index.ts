import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "@/db/schemas";
// Import all schema in one line

// Load environment variables
config({ path: ".env.local" });

const dbURL = process.env.POSTGRES_URL;
if (!dbURL) {
	console.error("POSTGRES_URL is not defined in the environment variables");
	throw new Error("POSTGRES_URL is not defined in the environment variables");
}

// ✅ Use Neon's serverless client instead of Pool from pg
const sql = neon(dbURL);

// ✅ Initialize Drizzle with Neon
export const db = drizzle(sql, { schema });

console.log("Database connection initialized successfully!");

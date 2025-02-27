import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const Blog = pgTable("Blog", {
	id: uuid("id").primaryKey().defaultRandom(), // UUID as primary key for better scalability
	title: text("title").notNull(),
	desc: text("desc").notNull(),
	date: timestamp("date", { withTimezone: true }).defaultNow(), // Ensures correct date handling
	publish_date: timestamp("publish_date", { withTimezone: true }), // Timestamp for publish date
	month: smallint("month").notNull(), // Numeric storage for month (1-12)
	author_name: text("author_name").notNull(),
});

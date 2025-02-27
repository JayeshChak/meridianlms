import {
	pgTable,
	uuid,
	text,
	timestamp,
	time,
	integer,
} from "drizzle-orm/pg-core";

export const Meeting = pgTable("Meeting", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),
	date: timestamp("date", { withTimezone: true }).notNull(),
	duration: integer("duration").notNull(), // Store duration in minutes for better calculations
	starting_time: time("starting_time", { withTimezone: true }).notNull(),
	speaker_name: text("speaker_name").notNull(),
	department: text("department").notNull(),
});

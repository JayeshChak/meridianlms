import {
	text,
	varchar,
	uuid,
	pgTable,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { Chapters } from "./Chapters";

// Lectures Table
export const Lectures = pgTable("Lectures", {
	id: uuid("id").defaultRandom().primaryKey(),
	chapter_id: uuid("chapter_id")
		.references(() => Chapters.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	duration: varchar("duration", { length: 100 }).notNull(),
	video_url: varchar("video_url", { length: 500 }).notNull(),
	is_preview: boolean("is_preview").default(false).notNull(),
	is_locked: boolean("is_locked").default(true).notNull(),
	order: integer("order").notNull(), // Changed to `integer` for numeric sorting
});

export type Lecture = InferSelectModel<typeof Lectures>;
export type LectureInsert = InferInsertModel<typeof Lectures>;

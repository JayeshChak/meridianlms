import { text, varchar, uuid, pgTable } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { Courses } from "./Courses";

export const Chapters = pgTable("Chapters", {
	id: uuid("id").defaultRandom().primaryKey(),
	course_id: uuid("course_id")
		.references(() => Courses.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	questionnaire_id: uuid("questionnaire_id"),
	order: varchar("order", { length: 50 }),
	duration: varchar("duration", { length: 100 }).notNull(),
});

export type Chapter = InferSelectModel<typeof Chapters>;
export type ChapterInsert = InferInsertModel<typeof Chapters>;

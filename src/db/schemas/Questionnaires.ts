import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { Courses } from "./Courses";
import { Chapters } from "./Chapters";

export const Questionnaires = pgTable("Questionnaires", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),

	course_id: uuid("course_id")
		.references(() => Courses.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		})
		.notNull(),

	chapter_id: uuid("chapter_id").references(() => Chapters.id, {
		onUpdate: "cascade",
		onDelete: "cascade",
	}),

	is_required: boolean("is_required").default(true).notNull(),
	min_pass_score: integer("min_pass_score").default(80).notNull(),

	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

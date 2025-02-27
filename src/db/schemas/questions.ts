import {
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	jsonb,
} from "drizzle-orm/pg-core";
import { Questionnaires } from "./Questionnaires";

export const Questions = pgTable("Questions", {
	id: uuid("id").defaultRandom().primaryKey(),
	questionnaire_id: uuid("questionnaire_id")
		.references(() => Questionnaires.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		})
		.notNull(),
	question: text("question").notNull(),
	options: jsonb("options").notNull(), // Changed to JSONB for better performance
	correct_answer: varchar("correct_answer", { length: 255 }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

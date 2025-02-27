import {
	pgTable,
	text,
	integer,
	timestamp,
	jsonb,
	uuid,
} from "drizzle-orm/pg-core";
import { User } from "./User";
import { Questionnaires } from "./Questionnaires";

export const QuizAttempts = pgTable("QuizAttempts", {
	id: uuid("id").defaultRandom().primaryKey(),
	user_id: uuid("user_id")
		.references(() => User.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		})
		.notNull(),
	questionnaire_id: uuid("questionnaire_id")
		.references(() => Questionnaires.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		})
		.notNull(),
	score: integer("score").notNull(),
	answers: jsonb("answers").notNull(),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Types for TypeScript
export type QuizAttempt = typeof QuizAttempts.$inferSelect;
export type NewQuizAttempt = typeof QuizAttempts.$inferInsert;

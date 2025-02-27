import { pgTable, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { Courses } from "./Courses";
import { Questionnaires } from "./Questionnaires";

export const CourseQuestionnaires = pgTable("CourseQuestionnaires", {
	id: uuid("id").defaultRandom().primaryKey(),
	course_id: uuid("course_id")
		.references(() => Courses.id, { onDelete: "cascade" })
		.notNull(),
	questionnaire_id: uuid("questionnaire_id")
		.references(() => Questionnaires.id, { onDelete: "cascade" })
		.notNull(),
	is_active: boolean("is_active").default(true).notNull(),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

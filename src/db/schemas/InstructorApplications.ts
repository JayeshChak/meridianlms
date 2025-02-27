import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { User } from "./User";

export const InstructorApplications = pgTable("InstructorApplications", {
	id: uuid("id").defaultRandom().primaryKey(),
	user_id: uuid("user_id")
		.references(() => User.id, { onDelete: "cascade" })
		.notNull(),
	instructor_bio: text("instructor_bio").default(""),
	qualifications: jsonb("qualifications").default("[]").notNull(),
	status: text("status").default("pending").notNull(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

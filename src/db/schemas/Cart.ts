import {
	text,
	boolean,
	varchar,
	uuid,
	decimal,
	timestamp,
	pgTable,
} from "drizzle-orm/pg-core";
import { User } from "./User";
import { Courses } from "./Courses";

export const Cart = pgTable("Cart", {
	id: uuid("id").defaultRandom().primaryKey(), // UUID for scalability
	user_id: uuid("user_id")
		.references(() => User.id, { onDelete: "cascade" }) // Ensuring cascading deletes
		.notNull(),
	course_id: uuid("course_id")
		.references(() => Courses.id, { onDelete: "cascade" }) // Ensuring cascading deletes
		.notNull(),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(), // Standard timestamp with timezone
});

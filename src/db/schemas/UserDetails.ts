import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { User } from "./User";

export const UserDetails = pgTable("UserDetails", {
	id: uuid("id").defaultRandom().primaryKey(),
	user_id: uuid("user_id")
		.references(() => User.id, { onDelete: "cascade" })
		.notNull(),
	biography: text("biography"),
	expertise: text("expertise")
		.array()
		.default(sql`'{}'::text[]`)
		.notNull(),
	registration_date: timestamp("registration_date", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

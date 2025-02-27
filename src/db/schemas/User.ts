import { sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	text,
	boolean,
	timestamp,
	jsonb,
} from "drizzle-orm/pg-core";

export const User = pgTable("User", {
	id: uuid("id").defaultRandom().primaryKey(),
	unique_identifier: text("unique_identifier").unique().notNull(),
	name: text("name").notNull(),
	username: text("username").unique(),
	phone: text("phone").unique(),
	email: text("email").unique().notNull(),
	password: text("password").notNull(),
	email_verified: timestamp("email_verified", { withTimezone: true }),
	image: text("image"),
	roles: jsonb("roles")
		.default(sql`'["User"]'::jsonb`)
		.notNull(),
	enrolled_courses: jsonb("enrolled_courses")
		.default(sql`'[]'::jsonb`)
		.notNull(),
	wishlist: jsonb("wishlist")
		.default(sql`'[]'::jsonb`)
		.notNull(),
	is_verified: boolean("is_verified").default(false).notNull(),
	activation_token: text("activation_token"),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	instructor_bio: text("instructor_bio").default(""),
	qualifications: jsonb("qualifications")
		.default(sql`'[]'::jsonb`)
		.notNull(),
});

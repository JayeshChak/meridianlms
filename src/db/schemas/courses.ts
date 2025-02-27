import {
	text,
	boolean,
	varchar,
	uuid,
	decimal,
	timestamp,
	pgTable,
	jsonb,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, sql } from "drizzle-orm";
import { User } from "./User";

// _Courses_
export const Courses = pgTable("Courses", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	lesson: varchar("lesson", { length: 100 }).notNull(),
	duration: varchar("duration", { length: 100 }).notNull(),
	featured: boolean("featured").default(false).notNull(),
	estimated_price: decimal("estimated_price", { precision: 10, scale: 2 }),
	is_free: boolean("is_free").default(false).notNull(),
	tag: varchar("tag", { length: 100 }).notNull(),
	skill_level: varchar("skill_level", { length: 100 }).notNull(),
	categories: jsonb("categories")
		.default(sql`'[]'::jsonb`)
		.notNull(),
	instructor_name: varchar("instructor_name", { length: 255 }).notNull(),
	thumbnail: text("thumbnail"),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	user_id: uuid("user_id")
		.references(() => User.id, { onDelete: "cascade" })
		.notNull(),
	demo_video_url: varchar("demo_video_url", { length: 500 }),
	is_published: boolean("is_published").default(false).notNull(),
	enrolled_count: integer("enrolled_count").default(0).notNull(),
	discount: decimal("discount", { precision: 10, scale: 2 })
		.default("0")
		.notNull(),
	extras: jsonb("extras")
		.default(sql`'{}'::jsonb`)
		.notNull(),
	reviews: jsonb("reviews")
		.default(sql`'[]'::jsonb`)
		.notNull(),
	comments: jsonb("comments")
		.default(sql`'[]'::jsonb`)
		.notNull(),
	certificate_id: uuid("certificate_id"),
});

export type Course = InferSelectModel<typeof Courses>;
export type CourseInsert = InferInsertModel<typeof Courses>;

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const Categories = pgTable("Categories", {
	id: uuid("id").defaultRandom().primaryKey(), // UUID for scalability
	title: text("title").notNull(),
	description: text("description"),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(), // Standard timestamp with timezone
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(), // Standard timestamp with timezone
});

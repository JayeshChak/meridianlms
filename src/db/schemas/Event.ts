import { pgTable, uuid, text, varchar } from "drizzle-orm/pg-core";

export const Event = pgTable("Event", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	duration: varchar("duration", { length: 100 }).notNull(),
	speaker: varchar("speaker", { length: 255 }).notNull(),
});

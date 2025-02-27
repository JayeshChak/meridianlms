import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { Courses } from "./Courses";

export const Files = pgTable("Files", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	path: varchar("path", { length: 255 }).notNull(),
	size: integer("size").notNull(),
	course_id: uuid("course_id").references(() => Courses.id, {
		onDelete: "cascade",
	}),
});

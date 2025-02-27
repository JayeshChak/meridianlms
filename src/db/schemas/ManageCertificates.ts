import {
	foreignKey,
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
} from "drizzle-orm/pg-core";
import { Courses } from "./Courses";

export const ManageCertificates = pgTable(
	"ManageCertificates",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		description: text("description").notNull(),
		course_id: uuid("course_id")
			.references(() => Courses.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			})
			.notNull(),
		created_at: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		is_deleted: boolean("is_deleted").default(false).notNull(),
		deleted_at: timestamp("deleted_at", { withTimezone: true }),
	},
	(table) => {
		return {
			managecertificates_courseFk: foreignKey({
				columns: [table.course_id],
				foreignColumns: [Courses.id],
				name: "managecertificates_courseFk",
			}),
		};
	}
);

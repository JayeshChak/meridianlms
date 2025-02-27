import {
	pgTable,
	uuid,
	text,
	timestamp,
	boolean,
	integer,
	jsonb,
	foreignKey,
	unique,
} from "drizzle-orm/pg-core";
import { User } from "./User";
import { Courses } from "./Courses";

export const Certification = pgTable(
	"Certification",
	{
		id: uuid("id").defaultRandom().primaryKey().notNull(),
		owner_id: uuid("owner_id").notNull(),
		certificate_data_url: text("certificate_data_url").notNull(),
		description: text("description").default("description").notNull(),
		is_published: boolean("is_published").default(false).notNull(),
		unique_identifier: text("unique_identifier").notNull().unique(),
		title: text("title").default("title_here").notNull(),
		expiration_date: timestamp("expiration_date", { withTimezone: true }),
		is_revocable: boolean("is_revocable").default(true).notNull(),
		created_at: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		deleted_at: timestamp("deleted_at", { withTimezone: true }),
		metadata: jsonb("metadata"),
		is_enabled: boolean("is_enabled").default(true).notNull(),
		orientation: text("orientation").default("landscape").notNull(),
		max_download: integer("max_download").default(1).notNull(),
		is_deleted: boolean("is_deleted").default(false).notNull(),
		course_id: uuid("course_id")
			.references(() => Courses.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			})
			.notNull(),
	},
	(table) => {
		return {
			certificationOwnerIdUserIdFk: foreignKey({
				columns: [table.owner_id],
				foreignColumns: [User.id],
				name: "Certification_ownerId_User_id_fk",
			}),
			certificationUniqueIdentifierUnique: unique(
				"Certification_uniqueIdentifier_unique"
			).on(table.unique_identifier),
		};
	}
);

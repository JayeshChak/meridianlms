import {
	pgTable,
	uuid,
	text,
	boolean,
	integer,
	decimal,
	foreignKey,
} from "drizzle-orm/pg-core";
import { Certification } from "./Certification";

export const Placeholders = pgTable(
	"Placeholders",
	{
		id: uuid("id").defaultRandom().primaryKey().notNull(),
		certificate_id: uuid("certificate_id")
			.references(() => Certification.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			})
			.notNull(),
		key: text("key").notNull(),
		discount: integer("discount").default(0).notNull(),
		x: decimal("x", { precision: 10, scale: 2 }).default("0").notNull(),
		y: decimal("y", { precision: 10, scale: 2 }).default("0").notNull(),
		font_size: decimal("font_size", { precision: 5, scale: 2 })
			.default("12")
			.notNull(),
		is_visible: boolean("is_visible").default(true).notNull(),
		label: text("label").default("PlaceHolderLabel").notNull(),
		color: text("color").default("#000000").notNull(),
		value: text("value").default("PlaceHolderValue").notNull(),
	},
	(table) => {
		return {
			placeholderCertificateFk: foreignKey({
				columns: [table.certificate_id],
				foreignColumns: [Certification.id],
				name: "placeholders_certificate_id_certifications_id_fk",
			}),
		};
	}
);

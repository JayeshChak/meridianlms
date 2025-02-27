import { pgTable, uuid, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { User } from "./User";
import { Certification } from "./Certification";

export const CertificateIssuance = pgTable("CertificateIssuance", {
	id: uuid("id").defaultRandom().primaryKey(),
	certificate_id: uuid("certificate_id")
		.references(() => Certification.id, { onDelete: "cascade" })
		.notNull(),
	issued_by: uuid("issued_by").references(() => User.id, {
		onDelete: "set null",
	}),
	issued_to: uuid("issued_to")
		.references(() => User.id, { onDelete: "cascade" })
		.notNull(),
	signature: text("signature"),
	description: text("description"),
	issuance_unique_identifier: text("issuance_unique_identifier")
		.unique()
		.notNull(),
	is_revoked: boolean("is_revoked").default(false).notNull(),
	revocation_reason: text("revocation_reason"),
	is_expired: boolean("is_expired").default(false).notNull(),
	expiration_date: timestamp("expiration_date", { withTimezone: true }),
	issued_at: timestamp("issued_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

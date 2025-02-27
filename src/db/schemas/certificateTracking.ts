import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { Certification } from "./Certification";

export const CertificateTracking = pgTable("CertificateTracking", {
	id: uuid("id").defaultRandom().primaryKey(),
	certificate_id: uuid("certificate_id")
		.references(() => Certification.id, { onDelete: "cascade" })
		.notNull(),
	verification_code: text("verification_code").unique().notNull(),
	holder_name: text("holder_name").notNull(),
	issue_date: timestamp("issue_date", { withTimezone: true }).notNull(),
	expiry_date: timestamp("expiry_date", { withTimezone: true }),
	last_verified_at: timestamp("last_verified_at", { withTimezone: true }),
	status: text("status").notNull(),
	grade: text("grade"),
	score: text("score"),
	digital_signature: text("digital_signature"),
	verification_history: text("verification_history"),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

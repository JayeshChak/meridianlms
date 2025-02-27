import {
	pgTable,
	uuid,
	text,
	timestamp,
	decimal,
	jsonb,
} from "drizzle-orm/pg-core";
import { User } from "./User";

export const Orders = pgTable("Orders", {
	id: uuid("id").defaultRandom().primaryKey(),
	user_id: uuid("user_id")
		.references(() => User.id, { onDelete: "cascade" })
		.notNull(),
	status: text("status").notNull(),
	total_amount: decimal("total_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	payment_method: text("payment_method").notNull(),
	items: jsonb("items").notNull(),
	created_at: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

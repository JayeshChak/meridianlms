import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const VerificationToken = pgTable(
	"VerificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").unique().notNull(),
		expires: timestamp("expires", { withTimezone: true }).notNull(),
	},
	(table) => ({
		verificationTokenUnique: uniqueIndex("verificationTokenUnique").on(
			table.identifier,
			table.token
		),
	})
);

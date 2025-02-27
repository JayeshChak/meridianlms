import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { User } from "./User";

export const UserSocials = pgTable("UserSocials", {
	id: uuid("id").defaultRandom().primaryKey(),
	user_id: uuid("user_id")
		.references(() => User.id, { onDelete: "cascade" })
		.notNull(),
	facebook: text("facebook").default("").notNull(),
	twitter: text("twitter").default("").notNull(),
	linkedin: text("linkedin").default("").notNull(),
	website: text("website").default("").notNull(),
	github: text("github").default("").notNull(),
});

import { pgTable, uuid } from "drizzle-orm/pg-core";
import { User } from "./User";
import { Categories } from "./Categories";

export const UserCategories = pgTable(
	"UserCategories",
	{
		user_id: uuid("user_id")
			.references(() => User.id, { onDelete: "cascade" })
			.notNull(),
		category_id: uuid("category_id")
			.references(() => Categories.id, { onDelete: "cascade" })
			.notNull(),
	},
	(table) => ({
		pk: table.primaryKey(["user_id", "category_id"]), // Composite Primary Key
	})
);

import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

import { categoriesTable } from "./categories";

export const itemsTable = pgTable("items", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  done: boolean("done").notNull().default(false),
  position: integer("position").notNull().default(0),
});

export type Item = typeof itemsTable.$inferSelect;
export type InsertItem = typeof itemsTable.$inferInsert;

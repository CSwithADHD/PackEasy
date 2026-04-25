import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { tripsTable } from "./trips";

export const categoriesTable = pgTable("categories", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => tripsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("folder"),
  position: integer("position").notNull().default(0),
});

export type Category = typeof categoriesTable.$inferSelect;
export type InsertCategory = typeof categoriesTable.$inferInsert;

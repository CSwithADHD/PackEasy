import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { tripsTable } from "./trips";

export const tasksTable = pgTable("tasks", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => tripsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Task = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;

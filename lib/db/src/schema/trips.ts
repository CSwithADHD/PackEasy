import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { usersTable } from "./users";

export const tripsTable = pgTable("trips", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  destination: text("destination").notNull(),
  country: text("country"),
  emoji: text("emoji"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Trip = typeof tripsTable.$inferSelect;
export type InsertTrip = typeof tripsTable.$inferInsert;

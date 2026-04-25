import {
  categoriesTable,
  db,
  itemsTable,
  tasksTable,
  tripsTable,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";

import { newId } from "../lib/ids";
import { seedDefaultChecklist } from "../lib/seed";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
router.use(requireAuth);

const createTripSchema = z.object({
  destination: z.string().trim().min(1).max(120),
  country: z.string().trim().max(120).optional().nullable(),
  emoji: z.string().trim().max(8).optional().nullable(),
  smart: z.boolean().optional().default(false),
});

const addCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().max(40).optional().default("folder"),
});

const addItemSchema = z.object({
  label: z.string().trim().min(1).max(200),
});

const patchItemSchema = z.object({
  done: z.boolean().optional(),
  label: z.string().trim().min(1).max(200).optional(),
});

const addTaskSchema = z.object({
  label: z.string().trim().min(1).max(200),
});

const patchTaskSchema = z.object({
  done: z.boolean().optional(),
  label: z.string().trim().min(1).max(200).optional(),
});

async function loadFullTrip(tripId: string, userId: string) {
  const tripRows = await db
    .select()
    .from(tripsTable)
    .where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId)))
    .limit(1);
  const trip = tripRows[0];
  if (!trip) return null;

  const categories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.tripId, tripId))
    .orderBy(asc(categoriesTable.position));

  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.tripId, tripId))
    .orderBy(asc(tasksTable.createdAt));

  const allItems =
    categories.length === 0
      ? []
      : await db
          .select()
          .from(itemsTable)
          .orderBy(asc(itemsTable.position));

  const itemsByCategory = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const arr = itemsByCategory.get(item.categoryId) ?? [];
    arr.push(item);
    itemsByCategory.set(item.categoryId, arr);
  }

  return {
    ...trip,
    categories: categories.map((c) => ({
      ...c,
      items: itemsByCategory.get(c.id) ?? [],
    })),
    tasks,
  };
}

router.get("/trips", async (req, res) => {
  const trips = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.userId, req.userId!))
    .orderBy(asc(tripsTable.createdAt));

  if (trips.length === 0) return res.json({ trips: [] });

  const tripIds = new Set(trips.map((t) => t.id));
  const allCats = await db.select().from(categoriesTable);
  const myCats = allCats.filter((c) => tripIds.has(c.tripId));

  const allItems = await db.select().from(itemsTable);
  const catIds = new Set(myCats.map((c) => c.id));
  const myItems = allItems.filter((i) => catIds.has(i.categoryId));

  const allTasks = await db.select().from(tasksTable);
  const myTasks = allTasks.filter((t) => tripIds.has(t.tripId));

  const itemsByCat = new Map<string, typeof myItems>();
  for (const it of myItems) {
    const arr = itemsByCat.get(it.categoryId) ?? [];
    arr.push(it);
    itemsByCat.set(it.categoryId, arr);
  }
  const catsByTrip = new Map<string, typeof myCats>();
  for (const c of myCats) {
    const arr = catsByTrip.get(c.tripId) ?? [];
    arr.push(c);
    catsByTrip.set(c.tripId, arr);
  }
  const tasksByTrip = new Map<string, typeof myTasks>();
  for (const t of myTasks) {
    const arr = tasksByTrip.get(t.tripId) ?? [];
    arr.push(t);
    tasksByTrip.set(t.tripId, arr);
  }

  res.json({
    trips: trips.map((t) => ({
      ...t,
      categories: (catsByTrip.get(t.id) ?? [])
        .sort((a, b) => a.position - b.position)
        .map((c) => ({
          ...c,
          items: (itemsByCat.get(c.id) ?? []).sort(
            (a, b) => a.position - b.position,
          ),
        })),
      tasks: tasksByTrip.get(t.id) ?? [],
    })),
  });
});

router.post("/trips", async (req, res) => {
  const parsed = createTripSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const id = newId();
  await db.insert(tripsTable).values({
    id,
    userId: req.userId!,
    destination: parsed.data.destination,
    country: parsed.data.country ?? null,
    emoji: parsed.data.emoji ?? null,
  });
  if (parsed.data.smart) {
    await seedDefaultChecklist(id);
  }
  const full = await loadFullTrip(id, req.userId!);
  res.json({ trip: full });
});

router.get("/trips/:id", async (req, res) => {
  const trip = await loadFullTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "not_found" });
  res.json({ trip });
});

router.delete("/trips/:id", async (req, res) => {
  await db
    .delete(tripsTable)
    .where(and(eq(tripsTable.id, req.params.id), eq(tripsTable.userId, req.userId!)));
  res.json({ ok: true });
});

router.post("/trips/:id/seed", async (req, res) => {
  const trip = await loadFullTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "not_found" });
  await seedDefaultChecklist(req.params.id);
  const full = await loadFullTrip(req.params.id, req.userId!);
  res.json({ trip: full });
});

router.post("/trips/:id/categories", async (req, res) => {
  const parsed = addCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const trip = await loadFullTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "not_found" });
  const id = newId();
  await db.insert(categoriesTable).values({
    id,
    tripId: req.params.id,
    name: parsed.data.name,
    icon: parsed.data.icon,
    position: trip.categories.length,
  });
  res.json({ trip: await loadFullTrip(req.params.id, req.userId!) });
});

async function getCategoryAndAssertOwner(categoryId: string, userId: string) {
  const rows = await db
    .select({ category: categoriesTable, trip: tripsTable })
    .from(categoriesTable)
    .innerJoin(tripsTable, eq(tripsTable.id, categoriesTable.tripId))
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  const row = rows[0];
  if (!row || row.trip.userId !== userId) return null;
  return row;
}

async function getItemAndAssertOwner(itemId: string, userId: string) {
  const rows = await db
    .select({ item: itemsTable, category: categoriesTable, trip: tripsTable })
    .from(itemsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, itemsTable.categoryId))
    .innerJoin(tripsTable, eq(tripsTable.id, categoriesTable.tripId))
    .where(eq(itemsTable.id, itemId))
    .limit(1);
  const row = rows[0];
  if (!row || row.trip.userId !== userId) return null;
  return row;
}

async function getTaskAndAssertOwner(taskId: string, userId: string) {
  const rows = await db
    .select({ task: tasksTable, trip: tripsTable })
    .from(tasksTable)
    .innerJoin(tripsTable, eq(tripsTable.id, tasksTable.tripId))
    .where(eq(tasksTable.id, taskId))
    .limit(1);
  const row = rows[0];
  if (!row || row.trip.userId !== userId) return null;
  return row;
}

router.post("/categories/:id/items", async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const own = await getCategoryAndAssertOwner(req.params.id, req.userId!);
  if (!own) return res.status(404).json({ error: "not_found" });

  const existing = await db
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.categoryId, req.params.id));

  await db.insert(itemsTable).values({
    id: newId(),
    categoryId: req.params.id,
    label: parsed.data.label,
    position: existing.length,
  });
  res.json({ trip: await loadFullTrip(own.trip.id, req.userId!) });
});

router.patch("/items/:id", async (req, res) => {
  const parsed = patchItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const own = await getItemAndAssertOwner(req.params.id, req.userId!);
  if (!own) return res.status(404).json({ error: "not_found" });

  await db
    .update(itemsTable)
    .set({
      ...(parsed.data.done !== undefined ? { done: parsed.data.done } : {}),
      ...(parsed.data.label !== undefined ? { label: parsed.data.label } : {}),
    })
    .where(eq(itemsTable.id, req.params.id));
  res.json({ trip: await loadFullTrip(own.trip.id, req.userId!) });
});

router.delete("/items/:id", async (req, res) => {
  const own = await getItemAndAssertOwner(req.params.id, req.userId!);
  if (!own) return res.status(404).json({ error: "not_found" });
  await db.delete(itemsTable).where(eq(itemsTable.id, req.params.id));
  res.json({ trip: await loadFullTrip(own.trip.id, req.userId!) });
});

router.post("/trips/:id/tasks", async (req, res) => {
  const parsed = addTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const trip = await loadFullTrip(req.params.id, req.userId!);
  if (!trip) return res.status(404).json({ error: "not_found" });
  await db.insert(tasksTable).values({
    id: newId(),
    tripId: req.params.id,
    label: parsed.data.label,
  });
  res.json({ trip: await loadFullTrip(req.params.id, req.userId!) });
});

router.patch("/tasks/:id", async (req, res) => {
  const parsed = patchTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const own = await getTaskAndAssertOwner(req.params.id, req.userId!);
  if (!own) return res.status(404).json({ error: "not_found" });
  await db
    .update(tasksTable)
    .set({
      ...(parsed.data.done !== undefined ? { done: parsed.data.done } : {}),
      ...(parsed.data.label !== undefined ? { label: parsed.data.label } : {}),
    })
    .where(eq(tasksTable.id, req.params.id));
  res.json({ trip: await loadFullTrip(own.trip.id, req.userId!) });
});

router.delete("/tasks/:id", async (req, res) => {
  const own = await getTaskAndAssertOwner(req.params.id, req.userId!);
  if (!own) return res.status(404).json({ error: "not_found" });
  await db.delete(tasksTable).where(eq(tasksTable.id, req.params.id));
  res.json({ trip: await loadFullTrip(own.trip.id, req.userId!) });
});

export default router;

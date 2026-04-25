import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";

import { newId } from "../lib/ids";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { createSession, deleteSession } from "../lib/sessions";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

function publicUser(u: { id: string; email: string; name: string }) {
  return { id: u.id, email: u.email, name: u.name };
}

router.post("/auth/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "email_taken", message: "An account with that email already exists." });
  }

  const passwordHash = await hashPassword(password);
  const user = {
    id: newId(),
    email,
    name,
    passwordHash,
  };
  await db.insert(usersTable).values(user);
  const session = await createSession(user.id);

  res.json({
    user: publicUser(user),
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials", message: "Email or password is incorrect." });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "invalid_credentials", message: "Email or password is incorrect." });
  }
  const session = await createSession(user.id);
  res.json({
    user: publicUser(user),
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
  });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  if (req.sessionToken) {
    await deleteSession(req.sessionToken);
  }
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: "not_found" });
  res.json({ user: publicUser(user) });
});

export default router;

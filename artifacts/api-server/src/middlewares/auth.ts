import type { NextFunction, Request, Response } from "express";

import { findSession } from "../lib/sessions";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionToken?: string;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (token) {
    const found = await findSession(token);
    if (found) {
      req.userId = found.user.id;
      req.sessionToken = token;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

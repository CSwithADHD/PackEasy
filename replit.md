# Workspace

## Overview

pnpm workspace monorepo using TypeScript. PackEasy is a travel packing mobile app built with Expo React Native.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Mobile**: Expo SDK 54, React Native, expo-router (file-based routing)
- **State**: TanStack Query + React Context
- **Build**: esbuild (API server)

## Artifacts

### Mobile App (`artifacts/mobile`)
- Expo React Native app (PackEasy)
- Auth: custom JWT/session via `/api/auth/*`
- Token stored in AsyncStorage via `lib/auth-storage.ts`
- API calls via `@workspace/api-client-react`'s `customFetch` with `setBaseUrl` / `setAuthTokenGetter`

### API Server (`artifacts/api-server`)
- Express 5 server with routes: `/api/auth/*`, `/api/trips/*`, `/api/categories/*`, `/api/items/*`, `/api/tasks/*`
- Auth middleware: `attachUser` (populates req.userId from Bearer token)
- Session-based auth using `sessionsTable`

## Database Tables (lib/db)

- `users` — id, email, name, passwordHash, createdAt
- `sessions` — token (PK), userId, createdAt, expiresAt
- `trips` — id, userId, destination, country, emoji, startDate, endDate, createdAt
- `categories` — id, tripId, name, icon, position
- `items` — id, categoryId, label, done, position
- `tasks` — id, tripId, label, done, createdAt

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/mobile run dev` — run Expo dev server

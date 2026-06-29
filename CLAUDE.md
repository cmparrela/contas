# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Dev (both apps in parallel)
make dev        # or: pnpm dev

# Individual apps
make api        # API on :3333  (tsx watch)
make web        # Web on :3000  (next dev)

# Quality
make typecheck  # tsc --noEmit across all packages
make lint       # biome check
make lint-fix   # biome check --write
```

No test suite exists yet.

## Architecture

Pnpm monorepo with three packages:

- **`apps/api`** — Express 4 + MongoDB. Runs locally via `tsx watch src/local.ts`; deployed to Vercel as a serverless function from `api/index.ts`.
- **`apps/web`** — Next.js 15 App Router + React 19. Port 3000.
- **`packages/shared`** — Zod schemas (`schemas.ts`) and serialized TypeScript types (`types.ts`) shared between API and web. Types use string IDs and ISO date strings (no `ObjectId` or `Date`).

## API patterns

**Auth flow** — every protected route uses the `requireAuth` middleware (`src/middleware/requireAuth.ts`). It reads the Clerk JWT, calls `clerkClient.users.getUser()`, upserts the user into MongoDB (`repos/users`), and attaches `req.user` (typed via `src/types/express.d.ts`) for downstream handlers.

**Repos vs routes** — `src/repos/*.ts` own all MongoDB access (using `ObjectId` internally). `src/routes/*.ts` handle HTTP concerns: validate request bodies with shared Zod schemas via the `validate` middleware, call repos, serialize ObjectIds to strings before responding.

**DB** — lazy singleton in `src/db/mongo.ts`. `MONGODB_URI` and `MONGODB_DB` env vars required. Indexes are ensured at startup in `src/db/indexes.ts`.

## Web patterns

**Route groups** — `(auth)/` for public sign-in/sign-up pages; `(app)/` for authenticated pages (all routes go through `AppShell`).

**Layout** — `AppShell` renders a fixed right-side `Sidebar` (width `w-48`) and a `main` with `mr-48`. Clerk's `UserButton` lives at the bottom of the sidebar.

**API calls** — `src/lib/api-client.ts` exports `authedFetch(token, path, init?)` which prepends `NEXT_PUBLIC_API_URL` and injects the Clerk JWT as `Authorization: Bearer`. Per-resource modules in `src/lib/api/` wrap this. TanStack Query hooks in `src/lib/hooks/` consume those modules.

**Auth** — Clerk with `ptBR` localization. `src/middleware.ts` protects all routes except `/sign-in` and `/sign-up`. Clerk appearance is themed to CSS variables defined in `globals.css`.

## Code style

Biome enforces: 2-space indent, single quotes, trailing commas, 100-char line width. `useImportType` is warned — use `import type` for type-only imports.

## Env vars

Copy `.env.example` to `.env.local` in each app. Both need the same Clerk keys (`CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). The API additionally needs `MONGODB_URI`.

# Contas

Monthly bill tracker with support for shared expenses between connected users.

## Stack

| Layer | Technology |
|-------|-----------|
| Web | Next.js 15, React 19, Tailwind CSS |
| API | Express 4, Node.js ≥22 |
| Database | MongoDB |
| Auth | Clerk |
| Shared | Internal package with TypeScript types and Zod schemas |
| Monorepo | pnpm workspaces, Biome, TypeScript |

## Structure

```
apps/
  api/     — Express REST API (port 3333)
  web/     — Next.js App Router (port 3000)
packages/
  shared/  — Shared TypeScript types and Zod schemas
```

## Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- MongoDB (local or Atlas)
- [Clerk](https://clerk.com) account

## Setup

**1. Install dependencies:**

```bash
make install
```

**2. Set up environment variables:**

```bash
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```

Fill in the variables in each `.env.local` file:

`apps/api/.env.local`
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=contas
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

`apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Development

```bash
make dev      # start API + Web in parallel
make api      # API only (port 3333)
make web      # Web only (port 3000)
```

## Available commands

```bash
make help       # list all commands
make install    # install dependencies
make dev        # API + Web in parallel
make typecheck  # type-check all packages
make lint       # Biome check
make lint-fix   # Biome check with auto-fix
```

## API

All routes require Clerk authentication (`Authorization: Bearer <token>`).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bills` | List active bills for the authenticated user |
| POST | `/api/bills` | Create a bill |
| PUT | `/api/bills/:id` | Update a bill |
| DELETE | `/api/bills/:id` | Soft-delete a bill |
| GET | `/api/months/:year/:month` | List bills for a month (auto-initializes on first access) |
| PUT | `/api/months/:year/:month/:billId` | Update amount or mark as paid |
| POST | `/api/months/:year/:month/:billId/shared-paid` | Other user marks their portion as paid |
| POST | `/api/months/:year/:month/:billId/shared-confirm` | Payer confirms receiving the PIX transfer |
| GET/POST | `/api/connections` | Manage connections between users |

## Shared bills

Bills can be shared between two connected users. The system supports splitting by half (`half`) or a custom amount (`custom`), where `customSplitAmount` is what the other person owes. The shared payment flow tracks when each party paid and when the payer confirmed receiving the transfer.

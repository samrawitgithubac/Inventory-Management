# Inventory Management CRUD

An inventory management app built with **Next.js App Router**, **Drizzle ORM**, **Neon PostgreSQL**, **Cloudinary**, **Zod**, and **Tailwind CSS**.

## Features

- Dashboard with stats, charts, and product table
- App Router pages: `/`, `/products/new`, `/products/[id]/edit`
- Product images uploaded to Cloudinary
- Zod validation on API routes
- Dark mode and gold-themed dashboard UI
- Vitest unit tests and Playwright e2e tests
- Drizzle SQL migrations (committed in `drizzle/`)
- No authentication required

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env` and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Neon connection string (pooled) |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |

3. **Apply database schema**

   Prefer migrations (recommended for production):

   ```bash
   npm run db:migrate
   ```

   For quick local prototyping only:

   ```bash
   npm run db:push
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Description |
|------|-------------|
| `/` | Dashboard (supports `?status=low` filter) |
| `/products/new` | Add a product |
| `/products/[id]/edit` | Edit a product |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items |
| POST | `/api/items` | Create an item |
| GET | `/api/items/[id]` | Get one item |
| PUT | `/api/items/[id]` | Update an item |
| DELETE | `/api/items/[id]` | Delete an item |
| POST | `/api/upload` | Upload image to Cloudinary |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run db:generate` | Generate a new SQL migration from schema |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:push` | Push schema directly (dev only) |

## Project structure

```
src/
├── app/
│   ├── (inventory)/           # App routes (shared layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Dashboard (/)
│   │   └── products/
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   └── api/                   # REST API
├── components/
│   ├── inventory/             # Shell, provider, pages
│   ├── dashboard/
│   └── ui/
├── db/
│   ├── schema.ts
│   ├── queries/items.ts
│   └── index.ts
├── hooks/
├── lib/
│   └── validators/            # Zod schemas + API validation
└── types/
drizzle/                       # Committed SQL migrations
e2e/                           # Playwright tests
```

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod](https://zod.dev)
- [Neon](https://neon.tech) PostgreSQL
- [Cloudinary](https://cloudinary.com)
- [Vitest](https://vitest.dev) · [Playwright](https://playwright.dev)
- [Tailwind CSS](https://tailwindcss.com)

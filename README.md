# Inventory Management CRUD

A single-page inventory management app built with **Next.js**, **Drizzle ORM**, **Neon PostgreSQL**, **Cloudinary**, and **Tailwind CSS**.

## Features

- Create, read, update, and delete inventory items on one page
- Product images uploaded to Cloudinary
- Item details (name, description, quantity, price) stored in Neon PostgreSQL
- Responsive UI with Tailwind CSS
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

   Copy `.env.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Neon connection string |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |

3. **Push database schema**

   ```bash
   npm run db:push
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

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

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run db:push` — Push schema to Neon
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:migrate` — Run migrations

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team)
- [Neon](https://neon.tech) PostgreSQL
- [Cloudinary](https://cloudinary.com) image storage
- [Tailwind CSS](https://tailwindcss.com)

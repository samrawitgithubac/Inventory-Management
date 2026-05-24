import path from "path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const root = process.cwd();

config({ path: path.join(root, ".env"), override: true });
config({ path: path.join(root, ".env.local"), override: true });

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is missing. Add it to .env in the project root.");
  }
  const parsed = new URL(url);
  parsed.searchParams.delete("channel_binding");
  return parsed.toString();
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});

import path from "path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/lib/database-url";

const root = process.cwd();

config({ path: path.join(root, ".env"), override: true });
config({ path: path.join(root, ".env.local"), override: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});

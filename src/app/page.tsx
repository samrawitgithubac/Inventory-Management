import { desc } from "drizzle-orm";
import InventoryApp from "@/components/InventoryApp";
import { getDb } from "@/db";
import { items, type Item } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialItems: Item[] = [];
  let loadError: string | null = null;

  try {
    initialItems = await getDb()
      .select()
      .from(items)
      .orderBy(desc(items.createdAt));
  } catch (error) {
    console.error("Failed to load items on server:", error);
    loadError =
      "Could not connect to the database. Check DATABASE_URL in .env and restart the dev server.";
  }

  return <InventoryApp initialItems={initialItems} loadError={loadError} />;
}

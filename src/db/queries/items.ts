import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { items, type Item, type NewItem } from "@/db/schema";
import type { ItemPayload } from "@/lib/validators/item";

export async function listItems(): Promise<Item[]> {
  return getDb().select().from(items).orderBy(desc(items.createdAt));
}

export async function getItemById(id: number): Promise<Item | undefined> {
  const [item] = await getDb().select().from(items).where(eq(items.id, id));
  return item;
}

export async function createItem(data: ItemPayload): Promise<Item> {
  const values: NewItem = {
    name: data.name,
    description: data.description,
    quantity: data.quantity,
    price: data.price,
    imageUrl: data.imageUrl,
    imagePublicId: data.imagePublicId,
  };
  const [created] = await getDb().insert(items).values(values).returning();
  return created;
}

export async function updateItem(
  id: number,
  data: ItemPayload,
  existing: Item,
): Promise<Item | undefined> {
  const [updated] = await getDb()
    .update(items)
    .set({
      ...data,
      imageUrl: data.imageUrl ?? existing.imageUrl,
      imagePublicId: data.imagePublicId ?? existing.imagePublicId,
      updatedAt: new Date(),
    })
    .where(eq(items.id, id))
    .returning();
  return updated;
}

export async function deleteItem(id: number): Promise<void> {
  await getDb().delete(items).where(eq(items.id, id));
}

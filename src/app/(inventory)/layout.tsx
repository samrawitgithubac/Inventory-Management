import InventoryShell from "@/components/inventory/InventoryShell";
import { InventoryProvider } from "@/components/inventory/InventoryProvider";
import { listItems } from "@/db/queries/items";

export const dynamic = "force-dynamic";

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialItems: Awaited<ReturnType<typeof listItems>> = [];
  let loadError: string | null = null;

  try {
    initialItems = await listItems();
  } catch (error) {
    console.error("Failed to load items on server:", error);
    loadError =
      "Could not connect to the database. Check DATABASE_URL in .env and restart the dev server.";
  }

  return (
    <InventoryProvider initialItems={initialItems} loadError={loadError}>
      <InventoryShell productCount={initialItems.length}>{children}</InventoryShell>
    </InventoryProvider>
  );
}

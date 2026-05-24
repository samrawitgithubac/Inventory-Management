import { notFound } from "next/navigation";
import ProductFormPageClient from "@/components/inventory/ProductFormPageClient";
import { getItemById } from "@/db/queries/items";
import { parseItemId } from "@/lib/validators/item";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const itemId = parseItemId(id);

  if (itemId === null) {
    notFound();
  }

  const item = await getItemById(itemId);

  if (!item) {
    notFound();
  }

  return <ProductFormPageClient item={item} />;
}

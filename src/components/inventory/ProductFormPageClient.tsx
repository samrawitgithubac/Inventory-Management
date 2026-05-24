"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { EMPTY_PRODUCT_FORM } from "@/components/inventory/constants";
import ProductForm from "@/components/inventory/ProductForm";
import { useInventory } from "@/components/inventory/InventoryProvider";
import { routes } from "@/lib/routes";
import type { Item } from "@/types/item";
import type { ProductFormState } from "@/types/inventory";

type ProductFormPageClientProps = {
  item?: Item | null;
};

export default function ProductFormPageClient({ item }: ProductFormPageClientProps) {
  const router = useRouter();
  const imageInputId = useId();
  const { showToast, refreshAfterMutation } = useInventory();

  const editingId = item?.id ?? null;
  const [form, setForm] = useState<ProductFormState>(() =>
    item
      ? {
          name: item.name,
          description: item.description ?? "",
          quantity: String(item.quantity),
          price: item.price,
        }
      : EMPTY_PRODUCT_FORM,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  async function uploadProductImage() {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return { url: data.url as string, publicId: data.publicId as string };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let imageUrl: string | null = imagePreview;
      let imagePublicId: string | null = item?.imagePublicId ?? null;

      if (imageFile) {
        const uploaded = await uploadProductImage();
        if (uploaded) {
          imageUrl = uploaded.url;
          imagePublicId = uploaded.publicId;
        }
      }

      const res = await fetch(
        editingId ? `/api/items/${editingId}` : "/api/items",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            quantity: form.quantity,
            price: form.price,
            imageUrl,
            imagePublicId,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      await refreshAfterMutation();
      showToast(editingId ? "Product updated." : "Product added.", "success");
      router.push(routes.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <p className="text-sm text-[var(--muted)]">
        Inventory /{" "}
        <span className="font-medium text-[var(--foreground)]">
          {editingId ? "Edit" : "Add Product"}
        </span>
      </p>
      <h1 className="page-title mb-6 mt-1">
        {editingId ? "Edit product" : "Add product"}
      </h1>
      <ProductForm
        form={form}
        editingId={editingId}
        error={error}
        submitting={submitting}
        imageInputId={imageInputId}
        imagePreview={imagePreview}
        onChange={setForm}
        onSubmit={handleSubmit}
        onImageChange={handleImageChange}
        onClearImage={clearImage}
        onCancel={() => router.push(routes.dashboard)}
      />
    </div>
  );
}

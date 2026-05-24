import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { items } from "@/db/schema";
import { deleteImage } from "@/lib/cloudinary";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);

    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const [item] = await getDb().select().from(items).where(eq(items.id, itemId));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET item error:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);

    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const [existing] = await getDb()
      .select()
      .from(items)
      .where(eq(items.id, itemId));

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, quantity, price, imageUrl, imagePublicId } =
      body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const qty = Number(quantity);
    const priceNum = Number(price);

    if (Number.isNaN(qty) || qty < 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-negative number" },
        { status: 400 },
      );
    }

    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 },
      );
    }

    if (
      imagePublicId &&
      existing.imagePublicId &&
      imagePublicId !== existing.imagePublicId
    ) {
      await deleteImage(existing.imagePublicId);
    }

    const [updated] = await getDb()
      .update(items)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        quantity: qty,
        price: priceNum.toFixed(2),
        imageUrl: imageUrl ?? existing.imageUrl,
        imagePublicId: imagePublicId ?? existing.imagePublicId,
        updatedAt: new Date(),
      })
      .where(eq(items.id, itemId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT item error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);

    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const [existing] = await getDb()
      .select()
      .from(items)
      .where(eq(items.id, itemId));

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existing.imagePublicId) {
      try {
        await deleteImage(existing.imagePublicId);
      } catch (imageError) {
        console.warn("Cloudinary image delete failed (continuing):", imageError);
      }
    }

    await getDb().delete(items).where(eq(items.id, itemId));

    return NextResponse.json({ success: true, id: itemId });
  } catch (error) {
    console.error("DELETE item error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    );
  }
}

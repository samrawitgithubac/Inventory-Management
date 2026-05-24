import { NextResponse } from "next/server";
import {
  deleteItem,
  getItemById,
  updateItem,
} from "@/db/queries/items";
import { deleteImage } from "@/lib/cloudinary";
import { parseItemId, validateItemBody } from "@/lib/validators/item";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const itemId = parseItemId(id);

    if (itemId === null) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const item = await getItemById(itemId);

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
    const itemId = parseItemId(id);

    if (itemId === null) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const existing = await getItemById(itemId);

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = validateItemBody(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status },
      );
    }

    if (
      parsed.data.imagePublicId &&
      existing.imagePublicId &&
      parsed.data.imagePublicId !== existing.imagePublicId
    ) {
      await deleteImage(existing.imagePublicId);
    }

    const updated = await updateItem(itemId, parsed.data, existing);

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

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
    const itemId = parseItemId(id);

    if (itemId === null) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const existing = await getItemById(itemId);

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

    await deleteItem(itemId);

    return NextResponse.json({ success: true, id: itemId });
  } catch (error) {
    console.error("DELETE item error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    );
  }
}

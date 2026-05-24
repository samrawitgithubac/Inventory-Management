import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { items } from "@/db/schema";

export async function GET() {
  try {
    const allItems = await getDb()
      .select()
      .from(items)
      .orderBy(desc(items.createdAt));
    return NextResponse.json(allItems);
  } catch (error) {
    console.error("GET items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const [created] = await getDb()
      .insert(items)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        quantity: qty,
        price: priceNum.toFixed(2),
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST item error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}

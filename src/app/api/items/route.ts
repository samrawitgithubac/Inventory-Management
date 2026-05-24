import { NextResponse } from "next/server";
import { createItem, listItems } from "@/db/queries/items";
import { validateItemBody } from "@/lib/validators/item";

export async function GET() {
  try {
    const allItems = await listItems();
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
    const parsed = validateItemBody(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status },
      );
    }

    const created = await createItem(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST item error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}

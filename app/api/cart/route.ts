import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CartItem } from "@/lib/cart-context";

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CartItem => Boolean(item && typeof item === "object" && "productId" in item && "quantity" in item))
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
      stock: Math.max(0, Number(item.stock) || 0)
    }));
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ items: [] });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data: rows, error } = await supabase.from("cart_items").select("payload").eq("user_id", userId);
  if (error) {
    console.error("Cart load error:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }

  const items = sanitizeItems(rows?.map((row) => row.payload) ?? []);
  return NextResponse.json({ items });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

  const body = await request.json().catch(() => null);
  const items = sanitizeItems(body?.items);

  const { error: deleteError } = await supabase.from("cart_items").delete().eq("user_id", userId);
  if (deleteError) {
    console.error("Cart clear error:", deleteError);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }

  if (items.length) {
    const { error: insertError } = await supabase.from("cart_items").insert(
      items.map((item) => ({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
        payload: item
      }))
    );
    if (insertError) {
      console.error("Cart save error:", insertError);
      return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

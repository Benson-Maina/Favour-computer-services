"use client";

import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Product } from "@/lib/types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  clearCart: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CartItem => Boolean(item && typeof item === "object" && "productId" in item && "quantity" in item))
    .map((item) => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1), stock: Math.max(0, Number(item.stock) || 0) }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      if (items.length === 0) {
        try {
          const { data: rows, error } = await supabase.from("cart_items").select("payload").eq("user_id", data.user.id);
          if (!error && rows?.length) {
            const savedItems = rows.map((row) => row.payload as CartItem).filter(Boolean);
            if (savedItems.length) setItems(savedItems);
          }
        } catch (err) {
          console.error("Failed to load cart from Supabase:", err);
        }
      }
    });
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || syncInProgressRef.current) return;
    
    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce sync to prevent too frequent updates
    syncTimeoutRef.current = setTimeout(() => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      syncInProgressRef.current = true;
      
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) {
          syncInProgressRef.current = false;
          return;
        }

        try {
          await supabase.from("cart_items").delete().eq("user_id", data.user.id);
          
          if (items.length > 0) {
            await supabase.from("cart_items").insert(items.map((item) => ({
              user_id: data.user.id,
              product_id: item.productId,
              quantity: item.quantity,
              payload: item
            })));
          }
        } catch (err) {
          console.error("Failed to sync cart to Supabase:", err);
        } finally {
          syncInProgressRef.current = false;
        }
      });
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const updateQuantity = (productId: string, quantity: number) => {
      setItems((current) =>
        current
          .map((item) => (item.productId === productId ? { ...item, quantity: Math.min(Math.max(1, quantity), Math.max(1, item.stock)) } : item))
          .filter((item) => item.quantity > 0)
      );
    };

    return {
      items,
      hydrated,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem(product, quantity = 1) {
        if (product.stock <= 0) {
          toast.error("This product is out of stock.");
          return;
        }
        setItems((current) => {
          const existing = current.find((item) => item.productId === product.id);
          if (existing) {
            return current.map((item) => (item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item));
          }
          return [
            ...current,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0],
              price: product.salePrice ?? product.price,
              quantity: Math.min(quantity, product.stock),
              stock: product.stock
            }
          ];
        });
        toast.success(`${product.name} added to cart.`);
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
        toast.success("Item removed from cart.");
      },
      increaseItem(productId) {
        setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(item.quantity + 1, Math.max(1, item.stock)) } : item)));
      },
      decreaseItem(productId) {
        setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item)).filter((item) => item.quantity > 0));
      },
      clearCart() {
        setItems([]);
        toast.success("Cart cleared.");
      },
      setQuantity: updateQuantity
    };
  }, [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

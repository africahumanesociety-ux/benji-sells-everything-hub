import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  img: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

/** Returns (and creates if missing) a stable anonymous session ID. */
function getSessionId(): string {
  const key = "benji_cart_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const sessionId = useRef(getSessionId());
  const initialized = useRef(false);

  // Load cart from Supabase on mount; fall back to localStorage snapshot
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select("*")
          .eq("session_id", sessionId.current);

        if (error) throw error;

        if (data && data.length > 0) {
          setItems(
            data.map((row) => ({
              id: row.product_id,
              name: row.product_name,
              price: row.price_str,
              priceNum: row.price_num,
              img: row.img_url,
              quantity: row.quantity,
            }))
          );
        } else {
          // Try localStorage fallback
          const saved = localStorage.getItem("benji_cart_items");
          if (saved) {
            try {
              setItems(JSON.parse(saved));
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch {
        // Supabase table may not exist yet — use localStorage fallback
        const saved = localStorage.getItem("benji_cart_items");
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch {
            // ignore parse errors
          }
        }
      } finally {
        initialized.current = true;
      }
    };
    load();
  }, []);

  // Persist items to Supabase + localStorage whenever they change (skip initial load)
  useEffect(() => {
    if (!initialized.current) return;

    // localStorage snapshot (always works)
    localStorage.setItem("benji_cart_items", JSON.stringify(items));

    // Supabase upsert (best-effort — fail silently)
    const sync = async () => {
      if (items.length === 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("session_id", sessionId.current)
          .catch(() => {});
        return;
      }

      const rows = items.map((item) => ({
        session_id: sessionId.current,
        product_id: item.id,
        product_name: item.name,
        price_num: item.priceNum,
        price_str: item.price,
        img_url: item.img,
        quantity: item.quantity,
      }));

      await supabase
        .from("cart_items")
        .upsert(rows, { onConflict: "session_id,product_id" })
        .catch(() => {});

      // Remove any DB rows for products no longer in the cart
      const activeIds = items.map((i) => i.id);
      await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId.current)
        .not("product_id", "in", `(${activeIds.join(",")})`)
        .catch(() => {});
    };

    sync();
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.priceNum * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

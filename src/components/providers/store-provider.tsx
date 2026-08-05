"use client";

import * as React from "react";
import { toast } from "sonner";

const CART_KEY = "yadims.cart.v1";
const WISHLIST_KEY = "yadims.wishlist.v1";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  color: string | null;
  unitPrice: number;
  currency: string;
  unit: string;
  quantity: number;
}

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "remove"; key: string }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "clear" };

/** A cart line is identified by product + colour, so two colours stay separate. */
export const lineKey = (productId: string, color: string | null) => `${productId}::${color ?? ""}`;

function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const key = lineKey(action.line.productId, action.line.color);
      const existing = state.find((l) => lineKey(l.productId, l.color) === key);
      if (!existing) return [...state, action.line];
      return state.map((l) =>
        lineKey(l.productId, l.color) === key
          ? { ...l, quantity: l.quantity + action.line.quantity }
          : l,
      );
    }
    case "remove":
      return state.filter((l) => lineKey(l.productId, l.color) !== action.key);
    case "setQuantity":
      return state.flatMap((l) => {
        if (lineKey(l.productId, l.color) !== action.key) return [l];
        if (action.quantity < 1) return [];
        return [{ ...l, quantity: action.quantity }];
      });
    case "clear":
      return [];
  }
}

interface StoreContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addToCart: (line: CartLine) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string, name?: string) => void;
  isWishlisted: (productId: string) => boolean;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  hydrated: boolean;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = React.useReducer(cartReducer, [] as CartLine[]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [isCartOpen, setCartOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  // Rehydrate once on mount. Server render always starts from an empty cart,
  // so nothing here can cause a hydration mismatch.
  //
  // This is the textbook use of an effect — reading an external system
  // (localStorage) that does not exist during server render. It cannot be
  // adjusted during render, so the set-state-in-effect rule is suppressed
  // deliberately rather than worked around.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    dispatch({ type: "hydrate", lines: readJSON<CartLine[]>(CART_KEY, []) });
    setWishlist(readJSON<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = React.useCallback((line: CartLine) => {
    dispatch({ type: "add", line });
    toast.success("Added to cart", {
      description: `${line.name}${line.color ? ` - ${line.color}` : ""} x ${line.quantity} ${line.unit}${line.quantity > 1 ? "s" : ""}`,
    });
  }, []);

  const toggleWishlist = React.useCallback((productId: string, name?: string) => {
    setWishlist((current) => {
      const exists = current.includes(productId);
      toast[exists ? "message" : "success"](
        exists ? "Removed from wishlist" : "Saved to wishlist",
        name ? { description: name } : undefined,
      );
      return exists ? current.filter((id) => id !== productId) : [...current, productId];
    });
  }, []);

  const value = React.useMemo<StoreContextValue>(() => {
    const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    return {
      lines,
      itemCount,
      subtotal,
      addToCart,
      removeLine: (key) => dispatch({ type: "remove", key }),
      setQuantity: (key, quantity) => dispatch({ type: "setQuantity", key, quantity }),
      clearCart: () => dispatch({ type: "clear" }),
      wishlist,
      toggleWishlist,
      isWishlisted: (productId) => wishlist.includes(productId),
      isCartOpen,
      setCartOpen,
      hydrated,
    };
  }, [lines, wishlist, isCartOpen, hydrated, addToCart, toggleWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = React.useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within <StoreProvider>");
  return context;
}

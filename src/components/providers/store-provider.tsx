"use client";

import * as React from "react";
import { toast } from "sonner";

const WISHLIST_KEY = "yadims.wishlist.v1";

/**
 * Client-side store. The shop sells by enquiry — prices are agreed with each
 * customer on WhatsApp — so there is no cart or checkout here. All this keeps
 * is the wishlist: a list of fabric ids a visitor has saved to ask about,
 * persisted in localStorage so it survives a refresh.
 */
interface StoreContextValue {
  wishlist: string[];
  toggleWishlist: (productId: string, name?: string) => void;
  isWishlisted: (productId: string) => boolean;
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
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  // Rehydrate once on mount. Server render always starts empty, so nothing
  // here can cause a hydration mismatch. This is the textbook use of an effect
  // — reading an external system (localStorage) absent during server render —
  // so the set-state-in-effect rule is suppressed deliberately.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setWishlist(readJSON<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const toggleWishlist = React.useCallback((productId: string, name?: string) => {
    setWishlist((current) => {
      const exists = current.includes(productId);
      toast[exists ? "message" : "success"](
        exists ? "Removed from saved fabrics" : "Saved",
        name ? { description: name } : undefined,
      );
      return exists ? current.filter((id) => id !== productId) : [...current, productId];
    });
  }, []);

  const value = React.useMemo<StoreContextValue>(
    () => ({
      wishlist,
      toggleWishlist,
      isWishlisted: (productId) => wishlist.includes(productId),
      hydrated,
    }),
    [wishlist, hydrated, toggleWishlist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = React.useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within <StoreProvider>");
  return context;
}

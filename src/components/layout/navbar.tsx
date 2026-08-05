"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { luxeEase } from "@/lib/motion";
import { mainNav, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/components/providers/store-provider";
import { SearchCommand } from "@/components/layout/search-command";
import { Wordmark } from "@/components/layout/wordmark";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, wishlist, setCartOpen, hydrated } = useStore();
  const { scrollY } = useScroll();

  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));

  // Close the mobile drawer whenever navigation completes.
  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 ease-luxe",
          scrolled ? "glass shadow-soft" : "bg-transparent",
        )}
      >
        {/* Tight gaps at 320px, where the wordmark and four icons barely fit */}
        <div className="container flex h-[4.5rem] items-center justify-between gap-2 sm:gap-4 md:h-20 lg:gap-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full border-r-0 p-0 sm:max-w-sm">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <MobileMenu onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} home`}>
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden lg:flex lg:items-center lg:gap-9">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "link-underline text-sm tracking-wide transition-colors",
                    active ? "text-brand-600" : "text-foreground/75 hover:text-foreground",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search fabrics"
            >
              <Search />
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative hidden sm:inline-flex">
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart />
                <CountBadge count={hydrated ? wishlist.length : 0} />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <Link href="/account" aria-label="My account">
                <User />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart, ${hydrated ? itemCount : 0} items`}
            >
              <ShoppingBag />
              <CountBadge count={hydrated ? itemCount : 0} />
            </Button>
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: luxeEase }}
          className="absolute -right-0.5 -top-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-semibold text-white"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex h-full flex-col bg-brand-700 text-white">
      <div className="flex items-center justify-between px-6 py-6">
        <Wordmark tone="light" />
        <Button variant="ghost" size="icon" onClick={onNavigate} aria-label="Close menu">
          <X className="text-white" />
        </Button>
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 px-4">
        {mainNav.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: luxeEase }}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              className="block rounded-2xl px-4 py-3.5 font-display text-2xl transition-colors hover:bg-white/10"
            >
              {item.title}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="space-y-4 border-t border-white/15 px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="glass" size="sm">
            <Link href="/wishlist" onClick={onNavigate}>
              <Heart /> Wishlist
            </Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <Link href="/account" onClick={onNavigate}>
              <User /> Account
            </Link>
          </Button>
        </div>
        <p className="text-sm text-white/70">
          {siteConfig.contact.phone}
          <br />
          {siteConfig.contact.email}
        </p>
      </div>
    </div>
  );
}

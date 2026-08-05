"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, MapPin, Package, Settings, User } from "lucide-react";

import { cn } from "@/lib/utils";

export const accountNav = [
  { title: "Overview", href: "/account", icon: User },
  { title: "Orders", href: "/account/orders", icon: Package },
  { title: "Wishlist", href: "/wishlist", icon: Heart },
  { title: "Addresses", href: "/account/addresses", icon: MapPin },
  { title: "Notifications", href: "/account/notifications", icon: Bell },
  { title: "Settings", href: "/account/settings", icon: Settings },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
      {accountNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors duration-300",
              active
                ? "bg-brand-500 text-white"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

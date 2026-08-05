"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { ExternalLink, LogOut, Menu, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { adminNav } from "@/config/site";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/layout/wordmark";

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Component = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
  return <Component className={className} aria-hidden />;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="space-y-1">
      {adminNav.map((item) => {
        // `/admin` must match exactly or every child would light it up.
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors duration-300",
              active
                ? "bg-white/10 font-medium text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-brand-900 px-4 py-6">
      <Link href="/admin" onClick={onNavigate} className="px-3">
        <Wordmark tone="light" />
      </Link>

      <p className="mt-1 px-3 text-[0.6rem] uppercase tracking-[0.24em] text-gold-400">
        Dashboard
      </p>

      <div className="mt-8 flex-1 overflow-y-auto no-scrollbar">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <Link
        href="/"
        target="_blank"
        className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="h-4 w-4" aria-hidden /> View storefront
      </Link>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-0 h-dvh">
        <SidebarBody />
      </div>
    </aside>
  );
}

interface AdminTopbarProps {
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarUrl: string | null;
}

export function AdminTopbar({ name, email, role, initials, avatarUrl }: AdminTopbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close the drawer on navigation, adjusted during render.
  const [prevPath, setPrevPath] = React.useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMobileOpen(false);
  }

  const current = adminNav.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-5 backdrop-blur sm:px-8 lg:px-10">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r-0 p-0">
          <SheetTitle className="sr-only">Admin menu</SheetTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="font-display text-xl">{current?.title ?? "Overview"}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Search" className="hidden sm:inline-flex">
          <Search />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-secondary"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="bg-brand-700 text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight">{name}</span>
                <span className="block text-xs capitalize text-muted-foreground">{role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">Customer account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Store settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
              <form action={signOut} className="w-full">
                <button type="submit" className="flex w-full items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

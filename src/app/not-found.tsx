import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/layout/wordmark";

const suggestions = [
  { title: "Shop all fabrics", href: "/shop" },
  { title: "Collections", href: "/collections" },
  { title: "Gallery", href: "/gallery" },
  { title: "Contact us", href: "/contact" },
];

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-900 px-6 py-24 text-center text-white">
      {/* Oversized numeral, purely decorative */}
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[40vw] leading-none text-white/[0.04]"
        aria-hidden
      >
        404
      </span>

      <Link href="/" className="mb-14">
        <Wordmark tone="light" showTagline />
      </Link>

      <p className="eyebrow text-gold-400">Nothing on this bolt</p>

      <h1 className="mt-6 max-w-2xl text-display-md text-white">
        This page has been cut from the roll
      </h1>

      <p className="mt-6 max-w-md leading-relaxed text-white/65">
        The address you followed does not exist, or the piece it pointed to has sold. Everything
        else is still where you left it.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg" variant="gold">
          <Link href="/">
            <Home /> Back to the shop
          </Link>
        </Button>
        <Button asChild size="lg" variant="glass">
          <Link href="/shop">
            <Search /> Browse fabrics
          </Link>
        </Button>
      </div>

      <nav aria-label="Suggested pages" className="mt-16 w-full max-w-md">
        <ul className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-white/15 px-5 py-3.5 text-sm text-white/70 transition-all duration-500 ease-luxe hover:border-gold-400/60 hover:text-white"
              >
                {item.title}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}

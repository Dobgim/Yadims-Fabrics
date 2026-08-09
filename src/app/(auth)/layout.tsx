import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Wordmark } from "@/components/layout/wordmark";

/**
 * Split-screen auth shell: form on the left, a brand panel on the right.
 * The panel is decorative and drops away entirely below `lg`.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label={`${siteConfig.name} home`}>
            <Wordmark />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to shop
          </Link>
        </div>

        <main id="main" className="flex flex-1 items-center py-14">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </main>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>

      {/*
        A brand panel rather than a photograph. It previously carried a stock
        image and a customer quote; the quote was written, not given, and the
        photograph was not the shop's.
      */}
      <aside className="relative hidden overflow-hidden bg-brand-900 lg:block" aria-hidden>
        <div
          className="absolute inset-0 bg-[url('/brand/fabric-backdrop.svg')] bg-cover bg-center opacity-40"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-brand-900/30"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <p className="text-eyebrow font-medium uppercase text-gold-400">The Art of Fine Fabrics</p>
          <p className="mt-5 max-w-md font-display text-3xl leading-snug text-white">
            Cut to the length you need, by people who have sewn with it.
          </p>
          <p className="mt-5 text-sm text-white/55">Tam-Tam, opposite Bali Hotel — Yaoundé</p>
        </div>
      </aside>
    </div>
  );
}

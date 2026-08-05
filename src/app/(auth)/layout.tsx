import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/config/site";
import { shopPhotos } from "@/data/images";
import { Wordmark } from "@/components/layout/wordmark";

const AUTH_IMAGE = shopPhotos.laceShelves;

/**
 * Split-screen auth shell: form on the left, editorial imagery on the right.
 * The imagery is decorative and drops away entirely below `lg`.
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

      <aside className="relative hidden overflow-hidden bg-brand-900 lg:block" aria-hidden>
        <Image src={AUTH_IMAGE} alt="" fill sizes="50vw" className="object-cover" priority />
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-brand-900/20"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <p className="text-eyebrow font-medium uppercase text-gold-400">The Art of Fine Fabrics</p>
          <p className="mt-5 max-w-md font-display text-3xl leading-snug text-white">
            &ldquo;They talked me out of the expensive bolt and into the right one. That is the
            I did not expect that from anybody selling fabric.&rdquo;
          </p>
          <p className="mt-5 text-sm text-white/55">Grace Etonde — Fashion Student</p>
        </div>
      </aside>
    </div>
  );
}

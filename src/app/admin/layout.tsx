import type { Metadata } from "next";
import Link from "next/link";

import { isSupabaseConfigured } from "@/lib/env";
import { initialsOf } from "@/lib/utils";
import { getSession } from "@/lib/queries/account";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Wordmark } from "@/components/layout/wordmark";
import { AdminSidebar, AdminTopbar } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — YADIMS Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Route protection lives in middleware; this is the presentational shell.
  if (!isSupabaseConfigured) {
    return <AdminNotConfigured />;
  }

  const session = await getSession();
  const name = session?.profile?.full_name ?? "Staff";

  return (
    <div className="flex min-h-dvh bg-secondary/40">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          name={name}
          email={session?.email ?? ""}
          role={session?.profile?.role ?? "staff"}
          initials={initialsOf(session?.profile?.full_name)}
          avatarUrl={session?.profile?.avatar_url ?? null}
        />

        <main id="main" className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

function AdminNotConfigured() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-secondary/40 px-6 py-24 text-center">
      <Wordmark showTagline />

      <div className="max-w-lg space-y-3">
        <h1 className="font-display text-3xl">The dashboard needs a database</h1>
        <p className="leading-relaxed text-muted-foreground">
          The storefront runs on the fabrics bundled with the site. To add your own — with
          photographs, prices and stock — the shop needs somewhere to keep them. That takes about
          fifteen minutes, once, and costs nothing.
        </p>
      </div>

      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-left">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Follow ADMIN-SETUP.md
        </p>
        <ol className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1.</span> Create a free Supabase project.
          </li>
          <li>
            <span className="font-medium text-foreground">2.</span> Run the two files in{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">supabase/migrations</code>,
            init first.
          </li>
          <li>
            <span className="font-medium text-foreground">3.</span> Paste the three keys into{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">.env.local</code> and
            restart.
          </li>
          <li>
            <span className="font-medium text-foreground">4.</span> Sign up at /sign-up, then run{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
              supabase/make-admin.sql
            </code>
            .
          </li>
        </ol>
        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          The full instructions, including how to go live on Vercel, are in{" "}
          <span className="font-medium text-foreground">ADMIN-SETUP.md</span> in the project folder.
        </p>
      </div>

      <Button asChild variant="luxe">
        <Link href="/">Back to the shop</Link>
      </Button>
    </main>
  );
}

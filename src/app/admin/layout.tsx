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
          Add your Supabase URL, anon key and service-role key to{" "}
          <code className="rounded bg-card px-1.5 py-0.5 text-sm">.env.local</code>, then apply the
          migrations in <code className="rounded bg-card px-1.5 py-0.5 text-sm">supabase/migrations</code>.
          The storefront runs without this; the dashboard cannot.
        </p>
      </div>

      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-left">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Setup order</p>
        <ol className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li>1. Create a Supabase project and copy the three keys.</li>
          <li>2. Run 20250101000000_init.sql, then 20250101000001_rls.sql.</li>
          <li>3. Sign up through /sign-up, then set that profile&apos;s role to &lsquo;admin&rsquo;.</li>
          <li>4. Return here.</li>
        </ol>
      </div>

      <Button asChild variant="luxe">
        <Link href="/">Back to the shop</Link>
      </Button>
    </main>
  );
}

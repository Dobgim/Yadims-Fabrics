import Link from "next/link";
import { LogOut } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/env";
import { initialsOf } from "@/lib/utils";
import { getSession } from "@/lib/queries/account";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Without credentials the middleware guard cannot run, so explain the state
  // rather than showing an empty dashboard.
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader
          eyebrow="My account"
          title="Accounts are not configured yet"
          description="Add your Supabase URL and keys to .env.local, run the migrations in supabase/migrations, and this area comes to life."
          breadcrumbs={[{ name: "Account", href: "/account" }]}
        />
        <section className="section">
          <div className="container">
            <div className="rounded-4xl border border-dashed border-border p-10">
              <h2 className="font-display text-xl">What still works without a database</h2>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                The full storefront, cart, wishlist and checkout all run from the bundled catalogue.
                Orders are acknowledged but not persisted, and accounts are unavailable until
                Supabase is connected.
              </p>
              <Button asChild variant="luxe" className="mt-7">
                <Link href="/shop">Back to the shop</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const name = session?.profile?.full_name ?? "Your account";

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title={name}
        description={session?.email}
        breadcrumbs={[{ name: "Account", href: "/account" }]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-8 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={session?.profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="bg-brand-700 text-white">
                  {initialsOf(session?.profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{session?.email}</p>
              </div>
            </div>

            <AccountNav />

            <form action={signOut} className="mt-6">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-3 px-4 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </form>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { getSession } from "@/lib/queries/account";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-2xl">Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          How we address you and where we reach you about an order.
        </p>
        <div className="mt-8">
          <ProfileForm profile={session?.profile ?? null} email={session?.email ?? ""} />
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="font-display text-2xl">Password</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          We send a one-time link rather than asking for your current password, which is safer on a
          shared device.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/forgot-password">Send me a reset link</Link>
        </Button>
      </section>

      <Separator />

      <section>
        <h2 className="font-display text-2xl">Your data</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Ask us for a copy of everything we hold about you, or ask us to delete it. We respond
          within thirty days. Order records are kept for seven years because tax law requires it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/contact">Request my data</Link>
          </Button>
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-destructive">
            <Link href="/contact">Delete my account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";

import { getSession } from "@/lib/queries/account";
import { NotificationPreferences } from "@/components/account/notification-preferences";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function AccountNotificationsPage() {
  const session = await getSession();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Notifications</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Order updates always reach you — they are how we confirm a cut before we make it.
          Everything else is yours to switch off.
        </p>
      </div>

      <NotificationPreferences marketingOptIn={session?.profile?.marketing_opt_in ?? false} />
    </div>
  );
}

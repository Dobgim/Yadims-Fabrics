import type { Metadata } from "next";

import { getAdminSubscribers } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SubscribersTable } from "@/components/admin/subscribers-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage() {
  const subscribers = await getAdminSubscribers();
  const active = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Newsletter"
        description={`${active} active of ${subscribers.length} total. Every marketing email must carry a one-click unsubscribe — it is promised in the privacy policy.`}
      />
      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}

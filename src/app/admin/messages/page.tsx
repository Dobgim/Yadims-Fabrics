import type { Metadata } from "next";

import { getAdminMessages } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MessagesView } from "@/components/admin/messages-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Messages"
        description="Everything sent through the contact form. We promise a reply within one working day on the storefront, so keep this empty."
      />
      <MessagesView messages={messages} />
    </div>
  );
}

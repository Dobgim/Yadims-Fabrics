"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Mail, MessageCircle, Package } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const channels = [
  {
    id: "order-updates",
    icon: Package,
    title: "Order updates",
    body: "Confirmation, cutting, dispatch and delivery. Sent by WhatsApp and email.",
    locked: true,
  },
  {
    id: "new-arrivals",
    icon: Bell,
    title: "New arrivals",
    body: "One email a month when new bolts land on the shelf.",
    locked: false,
  },
  {
    id: "restocks",
    icon: Mail,
    title: "Restock alerts",
    body: "We tell you when a fabric on your wishlist comes back in.",
    locked: false,
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp broadcasts",
    body: "Occasional trunk shows and events. Never more than once a month.",
    locked: false,
  },
] as const;

export function NotificationPreferences({ marketingOptIn }: { marketingOptIn: boolean }) {
  // Marketing consent is the one preference backed by the database; the rest
  // are held locally until per-channel storage is added.
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() => ({
    "order-updates": true,
    "new-arrivals": marketingOptIn,
    restocks: marketingOptIn,
    whatsapp: false,
  }));

  const toggle = (id: string, value: boolean) => {
    setEnabled((current) => ({ ...current, [id]: value }));
    toast.success(value ? "Notifications on" : "Notifications off", {
      description: channels.find((c) => c.id === id)?.title,
    });
  };

  return (
    <>
      <ul className="space-y-3">
        {channels.map((channel) => (
          <li
            key={channel.id}
            className="flex items-start gap-4 rounded-3xl border border-border/70 bg-card p-6"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-800/60 dark:text-brand-200">
              <channel.icon className="h-4 w-4" aria-hidden />
            </span>

            <div className="min-w-0 flex-1">
              <Label htmlFor={channel.id} className="text-base">
                {channel.title}
              </Label>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{channel.body}</p>
              {channel.locked ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Always on — this is how we confirm a cut with you.
                </p>
              ) : null}
            </div>

            <Switch
              id={channel.id}
              checked={enabled[channel.id]}
              disabled={channel.locked}
              onCheckedChange={(value) => toggle(channel.id, value)}
              aria-label={channel.title}
            />
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Marketing consent is stored on your profile — change it any time in{" "}
        <Link href="/account/settings" className="text-brand-600 link-underline">
          settings
        </Link>
        .
      </p>
    </>
  );
}

"use client";

import * as React from "react";
import { Mail, MailOpen, Reply } from "lucide-react";
import { toast } from "sonner";

import { cn, formatDate } from "@/lib/utils";
import { updateMessageStatus } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { ContactMessageRow, MessageStatus } from "@/types/database";

const filters: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

export function MessagesView({ messages }: { messages: ContactMessageRow[] }) {
  const [filter, setFilter] = React.useState<MessageStatus | "all">("all");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const visible = filter === "all" ? messages : messages.filter((m) => m.status === filter);

  const setStatus = async (id: string, status: MessageStatus) => {
    setPendingId(id);
    const result = await updateMessageStatus(id, status);
    setPendingId(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter messages">
        {filters.map((option) => {
          const count =
            option.value === "all"
              ? messages.length
              : messages.filter((m) => m.status === option.value).length;

          return (
            <Button
              key={option.value}
              role="tab"
              aria-selected={filter === option.value}
              variant={filter === option.value ? "luxe" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </Button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-20 text-center">
          <MailOpen className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {filter === "all" ? "No messages yet." : `No ${filter} messages.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((message) => (
            <li
              key={message.id}
              className={cn(
                "rounded-3xl border bg-card p-6",
                message.status === "new" ? "border-brand-500" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-lg">{message.subject}</h3>
                    {message.status === "new" ? (
                      <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white">
                        New
                      </span>
                    ) : (
                      <span className="text-xs capitalize text-muted-foreground">
                        {message.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {message.name} · {message.email}
                    {message.phone ? ` · ${message.phone}` : ""} · {formatDate(message.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}>
                      <Reply /> Reply
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pendingId === message.id}
                    onClick={() =>
                      setStatus(message.id, message.status === "new" ? "read" : "archived")
                    }
                  >
                    <Mail />
                    {message.status === "new" ? "Mark read" : "Archive"}
                  </Button>
                </div>
              </div>

              <p className="mt-5 whitespace-pre-wrap border-t border-border pt-5 leading-relaxed text-muted-foreground">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

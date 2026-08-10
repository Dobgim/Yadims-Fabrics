"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { subscribeToNewsletter } from "@/app/actions/marketing";
import { Button } from "@/components/ui/button";
import { Honeypot } from "@/components/shared/honeypot";
import type { ActionResult } from "@/lib/validations";

interface NewsletterFormProps {
  source?: string;
  tone?: "light" | "dark";
  className?: string;
}

export function NewsletterForm({
  source = "footer",
  tone = "light",
  className,
}: NewsletterFormProps) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    subscribeToNewsletter,
    null,
  );
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const dark = tone === "dark";

  return (
    <form ref={formRef} action={formAction} className={cn("w-full", className)}>
      <Honeypot />
      <input type="hidden" name="source" value={source} />

      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:border sm:p-1.5",
          dark ? "sm:border-white/25 sm:bg-white/5" : "sm:border-border sm:bg-background",
        )}
      >
        <label htmlFor={`newsletter-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${source}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          className={cn(
            "h-12 flex-1 rounded-full border px-5 text-sm focus:outline-none sm:border-0 sm:bg-transparent",
            dark
              ? "border-white/25 bg-white/5 text-white placeholder:text-white/45"
              : "border-border bg-background placeholder:text-muted-foreground",
          )}
        />
        <SubmitButton dark={dark} success={state?.ok === true} />
      </div>

      {state && !state.ok && state.fieldErrors?.email ? (
        <p
          role="alert"
          className={cn("mt-2 pl-5 text-xs", dark ? "text-gold-200" : "text-destructive")}
        >
          {state.fieldErrors.email[0]}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton({ dark, success }: { dark: boolean; success: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={dark ? "gold" : "luxe"}
      disabled={pending}
      className="h-12 shrink-0"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Joining
        </>
      ) : success ? (
        <>
          <Check /> Subscribed
        </>
      ) : (
        <>
          Subscribe <ArrowRight />
        </>
      )}
    </Button>
  );
}

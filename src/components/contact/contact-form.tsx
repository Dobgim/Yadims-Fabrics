"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { submitContactMessage } from "@/app/actions/marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Honeypot } from "@/components/shared/honeypot";
import type { ActionResult } from "@/lib/validations";

const subjects = [
  "General enquiry",
  "Fabric recommendation",
  "Bulk / aso-ebi order",
  "Wholesale account",
  "Special sourcing",
  "Order or delivery",
];

export function ContactForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    submitContactMessage,
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

  const errorFor = (field: string) =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={errorFor("name")}>
          <Input id="name" name="name" autoComplete="name" placeholder="Ada Kounde" required />
        </Field>

        <Field label="Email" name="email" required error={errorFor("email")}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone (optional)" name="phone" error={errorFor("phone")}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+237 6xx xxx xxx"
          />
        </Field>

        <Field label="Subject" name="subject" required error={errorFor("subject")}>
          <select
            id="subject"
            name="subject"
            required
            defaultValue={subjects[0]}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" name="message" required error={errorFor("message")}>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={20}
          placeholder="Tell us what you are making, roughly when you need it, and any budget you are working to. The more you tell us, the better the recommendation."
        />
      </Field>

      <SubmitButton />

      <p className="text-xs leading-relaxed text-muted-foreground">
        We reply within one working day. Your details are used only to answer this message — see our{" "}
        <a href="/privacy-policy" className="link-underline text-brand-600">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="luxe" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Sending
        </>
      ) : (
        <>
          <Send /> Send message
        </>
      )}
    </Button>
  );
}

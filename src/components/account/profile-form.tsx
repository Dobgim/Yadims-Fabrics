"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileRow } from "@/types/database";
import type { ActionResult } from "@/lib/validations";

export function ProfileForm({ profile, email }: { profile: ProfileRow | null; email: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(updateProfile, null);

  React.useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  const errorFor = (field: string) =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <form action={formAction} className="max-w-md space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile?.full_name ?? ""}
          autoComplete="name"
          required
        />
        {errorFor("fullName") ? (
          <p role="alert" className="text-xs text-destructive">
            {errorFor("fullName")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly disabled />
        <p className="text-xs text-muted-foreground">
          Your sign-in address cannot be changed here — message us and we will move it for you.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile?.phone ?? ""}
          autoComplete="tel"
          placeholder="+237 6xx xxx xxx"
        />
      </div>

      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="marketingOptIn"
          name="marketingOptIn"
          defaultChecked={profile?.marketing_opt_in}
          className="mt-0.5"
        />
        <Label
          htmlFor="marketingOptIn"
          className="text-sm font-normal leading-relaxed text-muted-foreground"
        >
          Email me when new fabrics land. One email a month, one click to leave.
        </Label>
      </div>

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="luxe" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Saving
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );
}

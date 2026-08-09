"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword, type AuthFormState } from "../../../actions/auth";
import { Alert, Button, Input } from "../../../../components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Change password"}
    </Button>
  );
}

export default function PasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(changePassword, {});

  return (
    <form action={action} className="space-y-5">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Input
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={state.fields?.currentPassword}
      />

      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={12}
        hint="At least 12 characters."
        error={state.fields?.newPassword}
      />

      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={12}
        error={state.fields?.confirmPassword}
      />

      <SubmitButton />
    </form>
  );
}

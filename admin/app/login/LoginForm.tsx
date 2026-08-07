"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthFormState } from "../actions/auth";
import { Alert, Button, Card, Input } from "../../components/ui";

function SubmitButton() {
  // `useFormStatus` only reports the status of the form it is rendered inside,
  // which is why this is a separate component.
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(signIn, {});
  const next = useSearchParams().get("next") ?? "";

  return (
    <Card className="p-6">
      <form action={action} className="space-y-4">
        {state.error ? <Alert>{state.error}</Alert> : null}

        {/* Validated server-side before use — a same-site path only. */}
        <input type="hidden" name="next" value={next} />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          error={state.fields?.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fields?.password}
        />

        <SubmitButton />
      </form>
    </Card>
  );
}

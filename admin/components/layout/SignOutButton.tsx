"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "../../app/actions/auth";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <Inner />
    </form>
  );
}

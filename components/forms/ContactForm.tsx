"use client";

import { useState, type FormEvent } from "react";
import { initialFormState, submitEnquiry } from "@/lib/enquiry";
import { services } from "@/lib/site";
import {
  Field,
  FormAlert,
  FormSuccess,
  Honeypot,
  SelectField,
  SubmitButton,
  TextareaField,
} from "./Fields";

const subjects = [
  ...services.map((s) => s.title),
  "Material supply / BOQ",
  "Careers",
  "Something else",
];

/** General enquiry form used on the contact page. */
export default function ContactForm() {
  const [state, setState] = useState(initialFormState);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(await submitEnquiry(new FormData(event.currentTarget)));
    setPending(false);
  }

  if (state.status === "success") {
    return <FormSuccess title="Enquiry received" message={state.message} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormAlert state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          name="name"
          state={state}
          required
          autoComplete="name"
          placeholder="Your name"
        />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="tel"
          state={state}
          required
          autoComplete="tel"
          placeholder="10-digit mobile"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          state={state}
          autoComplete="email"
          placeholder="you@company.com"
        />
        <Field
          label="Company / organisation"
          name="company"
          state={state}
          autoComplete="organization"
          placeholder="Optional"
        />
      </div>

      <SelectField
        label="What is this about?"
        name="subject"
        state={state}
        options={subjects}
      />

      <TextareaField
        label="Your requirement"
        name="message"
        state={state}
        required
        rows={5}
        placeholder="Connected load, site location, capacity needed, timelines — whatever you already know."
      />

      <Honeypot />

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton pending={pending}>Send Enquiry</SubmitButton>
        <p className="text-xs text-ink-400">
          We reply within one working day. Your details are never shared.
        </p>
      </div>
    </form>
  );
}

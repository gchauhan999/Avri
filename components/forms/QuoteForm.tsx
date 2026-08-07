"use client";

import { useState, type FormEvent } from "react";
import { initialFormState, submitQuote } from "@/lib/enquiry";
import { getProduct } from "@/lib/products";
import { useQueryParam } from "@/lib/use-query-param";
import { contact, industries, services } from "@/lib/site";
import {
  Field,
  FormAlert,
  FormSuccess,
  Honeypot,
  SelectField,
  SubmitButton,
  TextareaField,
} from "./Fields";

const budgets = [
  "Under ₹5 lakh",
  "₹5 – 25 lakh",
  "₹25 lakh – 1 crore",
  "₹1 – 5 crore",
  "Above ₹5 crore",
  "Not decided yet",
];

const timelines = [
  "Immediately",
  "Within 1 month",
  "1 – 3 months",
  "3 – 6 months",
  "Planning stage",
];

/** Detailed quote request form. */
export default function QuoteForm({
  /** Pre-fills the product field when the caller already knows it. */
  product,
}: {
  product?: string;
}) {
  const [state, setState] = useState(initialFormState);
  const [pending, setPending] = useState(false);

  // `?product=<slug>` arrives from the "Request a Quote" button on a product
  // page, and is resolved in the browser — see `useQueryParam`.
  const slug = useQueryParam("product");
  const prefill = product ?? (slug ? getProduct(slug)?.name ?? "" : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(await submitQuote(new FormData(event.currentTarget)));
    setPending(false);
  }

  if (state.status === "success") {
    return (
      <FormSuccess title="Quote request received" message={state.message}>
        <p className="mt-4 text-sm text-ink-500">
          For anything urgent, call{" "}
          <a
            href={`tel:${contact.phones[0].replace(/[^\d+]/g, "")}`}
            className="font-semibold text-brand-700 underline"
          >
            {contact.phones[0]}
          </a>
          .
        </p>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormAlert state={state} />

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
          Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            name="name"
            state={state}
            required
            autoComplete="name"
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
            required
            autoComplete="email"
          />
          <Field
            label="Company / organisation"
            name="company"
            state={state}
            autoComplete="organization"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5 pt-2">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
          Project details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Service required"
            name="service"
            state={state}
            required
            options={services.map((s) => s.title)}
          />
          <SelectField
            label="Industry"
            name="industry"
            state={state}
            options={industries.map((i) => i.title)}
          />
          <Field
            /* The input is uncontrolled, so remount it when the slug read from
               the URL arrives after the first render. */
            key={prefill}
            label="Product of interest"
            name="product"
            state={state}
            defaultValue={prefill}
            placeholder="e.g. 11 kV RMU, 630 kVA transformer"
          />
          <Field
            label="Site location"
            name="location"
            state={state}
            required
            placeholder="City / district"
          />
          <Field
            label="Capacity or size"
            name="capacity"
            state={state}
            placeholder="e.g. 500 kW, 2 MVA, 20,000 sq ft"
          />
          <SelectField
            label="Indicative budget"
            name="budget"
            state={state}
            options={budgets}
          />
          <SelectField
            label="Expected timeline"
            name="timeline"
            state={state}
            options={timelines}
          />
        </div>

        <TextareaField
          label="Scope of work"
          name="message"
          state={state}
          required
          rows={5}
          placeholder="Describe the scope. If you already have a BOQ, drawing or tender document, mention it here and we will ask you to email it."
        />
      </fieldset>

      <Honeypot />

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton pending={pending}>Submit Quote Request</SubmitButton>
        <p className="text-xs text-ink-400">
          Or email your BOQ to{" "}
          <a
            href={`mailto:${contact.salesEmail}`}
            className="font-semibold text-ink-600 underline"
          >
            {contact.salesEmail}
          </a>
        </p>
      </div>
    </form>
  );
}

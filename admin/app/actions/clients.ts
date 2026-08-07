"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiServerJson } from "../../lib/api";

export interface ClientFormState {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
}

function toState(error: unknown, fallback: string): ClientFormState {
  if (error instanceof ApiError) {
    return { error: error.message, ...(error.fields ? { fields: error.fields } : {}) };
  }
  return { error: fallback };
}

function payload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim(),
    sector: String(formData.get("sector") ?? "").trim(),
    isAuthorized: formData.get("isAuthorized") === "on",
    authorizationNote: String(formData.get("authorizationNote") ?? "").trim(),
    isPublished: formData.get("isPublished") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    ...(formData.get("logoPath")
      ? {
          logoPath: String(formData.get("logoPath")),
          logoWidth: Number(formData.get("logoWidth")) || undefined,
          logoHeight: Number(formData.get("logoHeight")) || undefined,
        }
      : {}),
  };
}

export async function createClient(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    await apiServerJson("/api/admin/clients", "POST", payload(formData));
  } catch (error) {
    return toState(error, "Could not save that client.");
  }
  revalidatePath("/clients");
  return { ok: true };
}

export async function updateClient(
  id: number,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    await apiServerJson(`/api/admin/clients/${id}`, "PATCH", payload(formData));
  } catch (error) {
    return toState(error, "Could not save that client.");
  }
  revalidatePath("/clients");
  return { ok: true };
}

/**
 * The publish toggle from the list view.
 *
 * The API refuses to publish an unauthorised client, and so does a CHECK
 * constraint in the database. This just surfaces that refusal as a readable
 * message rather than a 422 in the console.
 */
export async function setClientPublished(id: number, isPublished: boolean) {
  try {
    await apiServerJson(`/api/admin/clients/${id}`, "PATCH", { isPublished });
  } catch (error) {
    return toState(error, "Could not change that client's visibility.");
  }
  revalidatePath("/clients");
  return { ok: true };
}

export async function deleteClient(id: number) {
  try {
    await apiServerJson(`/api/admin/clients/${id}`, "DELETE");
  } catch (error) {
    return toState(error, "Could not delete that client.");
  }
  revalidatePath("/clients");
  return { ok: true };
}

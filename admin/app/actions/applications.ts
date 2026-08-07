"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiServerJson } from "../../lib/api";

interface Result {
  ok?: boolean;
  error?: string;
}

const message = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

export async function setApplicationStatus(id: number, status: string): Promise<Result> {
  try {
    await apiServerJson(`/api/admin/applications/${id}`, "PATCH", { status });
  } catch (error) {
    return { error: message(error, "Could not update that application.") };
  }
  revalidatePath("/applications");
  revalidatePath("/");
  return { ok: true };
}

export async function saveApplicationNotes(id: number, adminNotes: string): Promise<Result> {
  try {
    await apiServerJson(`/api/admin/applications/${id}`, "PATCH", { adminNotes });
  } catch (error) {
    return { error: message(error, "Could not save those notes.") };
  }
  revalidatePath("/applications");
  return { ok: true };
}

/** Retry the HR notification when SMTP was down at the time. */
export async function resendApplication(id: number): Promise<Result> {
  try {
    const result = await apiServerJson<{ status: string; error: string | null }>(
      `/api/admin/applications/${id}/resend`,
      "POST"
    );
    if (result.status !== "sent") {
      return { error: result.error ?? "Still could not send that email." };
    }
  } catch (error) {
    return { error: message(error, "Could not resend that email.") };
  }
  revalidatePath("/applications");
  revalidatePath("/");
  return { ok: true };
}

/** Deletes the CV file as well as the row — see the API route. */
export async function deleteApplication(id: number): Promise<Result> {
  try {
    await apiServerJson(`/api/admin/applications/${id}`, "DELETE");
  } catch (error) {
    return { error: message(error, "Could not delete that application.") };
  }
  revalidatePath("/applications");
  revalidatePath("/");
  return { ok: true };
}

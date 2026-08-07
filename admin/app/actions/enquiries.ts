"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiServerJson } from "../../lib/api";

export interface ActionResult {
  ok?: boolean;
  error?: string;
}

export async function setEnquiryStatus(id: number, status: string): Promise<ActionResult> {
  try {
    await apiServerJson(`/api/admin/enquiries/${id}`, "PATCH", { status });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Could not update that enquiry." };
  }
  revalidatePath("/enquiries");
  revalidatePath("/");
  return { ok: true };
}

export async function saveEnquiryNotes(id: number, adminNotes: string): Promise<ActionResult> {
  try {
    await apiServerJson(`/api/admin/enquiries/${id}`, "PATCH", { adminNotes });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Could not save those notes." };
  }
  revalidatePath("/enquiries");
  return { ok: true };
}

/** Retry a notification email that failed to send. */
export async function resendEnquiry(id: number): Promise<ActionResult> {
  try {
    const result = await apiServerJson<{ status: string; error: string | null }>(
      `/api/admin/enquiries/${id}/resend`,
      "POST"
    );
    if (result.status !== "sent") {
      return { error: result.error ?? "Still could not send that email." };
    }
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Could not resend that email." };
  }
  revalidatePath("/enquiries");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEnquiry(id: number): Promise<ActionResult> {
  try {
    await apiServerJson(`/api/admin/enquiries/${id}`, "DELETE");
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Could not delete that enquiry." };
  }
  revalidatePath("/enquiries");
  revalidatePath("/");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiServerJson } from "../../lib/api";

export interface JobFormState {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
}

function toState(error: unknown, fallback: string): JobFormState {
  if (error instanceof ApiError) {
    return { error: error.message, ...(error.fields ? { fields: error.fields } : {}) };
  }
  return { error: fallback };
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

const numberOrUndefined = (formData: FormData, key: string) => {
  const raw = text(formData, key);
  return raw === "" ? undefined : Number(raw);
};

function payload(formData: FormData) {
  return {
    title: text(formData, "title"),
    department: text(formData, "department"),
    location: text(formData, "location"),
    employmentType: text(formData, "employmentType") || "full_time",
    experienceMin: numberOrUndefined(formData, "experienceMin"),
    experienceMax: numberOrUndefined(formData, "experienceMax"),
    openings: numberOrUndefined(formData, "openings") ?? 1,
    salaryRange: text(formData, "salaryRange"),
    salaryMin: numberOrUndefined(formData, "salaryMin"),
    salaryMax: numberOrUndefined(formData, "salaryMax"),
    salaryPeriod: text(formData, "salaryPeriod") || "month",
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    // One per line in the textarea; the API splits and trims.
    responsibilities: text(formData, "responsibilities"),
    requirements: text(formData, "requirements"),
    status: text(formData, "status") || "draft",
    closesAt: text(formData, "closesAt"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  };
}

export async function createJob(_prev: JobFormState, formData: FormData): Promise<JobFormState> {
  try {
    await apiServerJson("/api/admin/jobs", "POST", payload(formData));
  } catch (error) {
    return toState(error, "Could not save that role.");
  }
  revalidatePath("/jobs");
  return { ok: true };
}

export async function updateJob(
  id: number,
  _prev: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  try {
    await apiServerJson(`/api/admin/jobs/${id}`, "PATCH", payload(formData));
  } catch (error) {
    return toState(error, "Could not save that role.");
  }
  revalidatePath("/jobs");
  return { ok: true };
}

/** Open / close from the list, without opening the editor. */
export async function setJobStatus(id: number, status: "draft" | "open" | "closed") {
  try {
    await apiServerJson(`/api/admin/jobs/${id}`, "PATCH", { status });
  } catch (error) {
    return toState(error, "Could not change that role's status.");
  }
  revalidatePath("/jobs");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteJob(id: number) {
  try {
    await apiServerJson(`/api/admin/jobs/${id}`, "DELETE");
  } catch (error) {
    return toState(error, "Could not delete that role.");
  }
  revalidatePath("/jobs");
  return { ok: true };
}

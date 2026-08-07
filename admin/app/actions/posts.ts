"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiServerJson } from "../../lib/api";

export interface PostFormState {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
}

function toState(error: unknown, fallback: string): PostFormState {
  if (error instanceof ApiError) {
    return { error: error.message, ...(error.fields ? { fields: error.fields } : {}) };
  }
  return { error: fallback };
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function payload(formData: FormData) {
  return {
    title: text(formData, "title"),
    categoryId: Number(text(formData, "categoryId")) || undefined,
    excerpt: text(formData, "excerpt"),
    body: String(formData.get("body") ?? ""),
    coverImagePath: text(formData, "coverPath") || undefined,
    coverImageAlt: text(formData, "coverImageAlt"),
    coverImageWidth: Number(text(formData, "coverWidth")) || undefined,
    coverImageHeight: Number(text(formData, "coverHeight")) || undefined,
    status: text(formData, "status") || "draft",
    publishedAt: text(formData, "publishedAt"),
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    seoKeywords: text(formData, "seoKeywords"),
  };
}

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  try {
    await apiServerJson("/api/admin/posts", "POST", payload(formData));
  } catch (error) {
    return toState(error, "Could not save that article.");
  }
  revalidatePath("/blog");
  return { ok: true };
}

export async function updatePost(
  id: number,
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  try {
    await apiServerJson(`/api/admin/posts/${id}`, "PATCH", payload(formData));
  } catch (error) {
    return toState(error, "Could not save that article.");
  }
  revalidatePath("/blog");
  return { ok: true };
}

/** Publish / unpublish from the list, without opening the editor. */
export async function setPostStatus(id: number, status: "draft" | "published" | "archived") {
  try {
    await apiServerJson(`/api/admin/posts/${id}`, "PATCH", { status });
  } catch (error) {
    return toState(error, "Could not change that article's status.");
  }
  revalidatePath("/blog");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePost(id: number) {
  try {
    await apiServerJson(`/api/admin/posts/${id}`, "DELETE");
  } catch (error) {
    return toState(error, "Could not delete that article.");
  }
  revalidatePath("/blog");
  return { ok: true };
}

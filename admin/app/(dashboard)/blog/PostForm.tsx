"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Alert, Button, ButtonLink, Card, Input, Select, Textarea } from "../../../components/ui";
import ImageUpload from "../../../components/ImageUpload";
import RichTextEditor from "../../../components/RichTextEditor";
import { createPost, updatePost, type PostFormState } from "../../actions/posts";

export interface PostDetail {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  excerpt: string | null;
  body: string;
  cover: string | null;
  coverImagePath: string | null;
  coverImageAlt: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
}

export interface Category {
  id: number;
  name: string;
}

function Submit({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Create article" : "Save changes"}
    </Button>
  );
}

export default function PostForm({
  post,
  categories,
}: {
  post?: PostDetail;
  categories: Category[];
}) {
  const isNew = !post;
  const router = useRouter();

  const action = isNew ? createPost : updatePost.bind(null, post.id);
  const [state, formAction] = useActionState<PostFormState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) router.push("/blog");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Card className="space-y-5 p-6">
        <Input
          label="Title"
          name="title"
          required
          defaultValue={post?.title ?? ""}
          error={state.fields?.title}
          hint={
            post
              ? `Currently at /blog/${post.slug} — changing the title changes that URL.`
              : "The URL is generated from this."
          }
        />

        <Select
          label="Category"
          name="categoryId"
          required
          placeholder="Choose a category"
          defaultValue={post ? String(post.categoryId) : ""}
          error={state.fields?.categoryId}
          options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          className="max-w-sm"
        />

        <Textarea
          label="Excerpt"
          name="excerpt"
          rows={2}
          maxLength={400}
          defaultValue={post?.excerpt ?? ""}
          error={state.fields?.excerpt}
          hint="Shown on the card and in search results. Leave blank and the opening lines are used."
        />
      </Card>

      <Card className="space-y-5 p-6">
        <ImageUpload
          endpoint="/api/admin/posts/cover"
          label="Cover image"
          fieldPrefix="cover"
          aspect="aspect-[16/9]"
          hint="PNG, JPEG or WebP · up to 3 MB · landscape works best"
          initial={
            post?.coverImagePath && post.cover
              ? {
                  path: post.coverImagePath,
                  url: post.cover,
                  width: post.coverImageWidth,
                  height: post.coverImageHeight,
                }
              : null
          }
        />

        <Input
          label="Cover image description"
          name="coverImageAlt"
          defaultValue={post?.coverImageAlt ?? ""}
          hint="Read aloud by screen readers, and shown if the image fails to load."
        />
      </Card>

      <Card className="p-6">
        <RichTextEditor name="body" defaultValue={post?.body ?? ""} error={state.fields?.body} />
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-sm font-bold text-ink-900">Search listing</h2>
        <p className="-mt-3 text-sm text-ink-500">
          Optional. Leave blank and the title and excerpt above are used.
        </p>

        <Input label="Page title" name="seoTitle" maxLength={200} defaultValue={post?.seoTitle ?? ""} />
        <Textarea
          label="Meta description"
          name="seoDescription"
          rows={2}
          maxLength={320}
          defaultValue={post?.seoDescription ?? ""}
        />
        <Input
          label="Keywords"
          name="seoKeywords"
          maxLength={400}
          defaultValue={post?.seoKeywords ?? ""}
          hint="Comma separated. Minor signal these days — the article text matters far more."
        />
      </Card>

      <Card className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Status"
            name="status"
            defaultValue={post?.status ?? "draft"}
            options={[
              { value: "draft", label: "Draft — not visible on the site" },
              { value: "published", label: "Published — live on the blog" },
              { value: "archived", label: "Archived — removed from the site" },
            ]}
          />
          <Input
            label="Publish date"
            name="publishedAt"
            type="datetime-local"
            defaultValue={post?.publishedAt ? post.publishedAt.replace(" ", "T").slice(0, 16) : ""}
            hint="Leave blank to use now. A future date holds it back until then."
          />
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={post?.isFeatured ?? false}
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-ink-800">
            Feature at the top of the blog
            <span className="mt-0.5 block text-xs text-ink-400">
              Only one article can be featured; ticking this un-features the current one.
            </span>
          </span>
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <Submit isNew={isNew} />
        <ButtonLink href="/blog" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}

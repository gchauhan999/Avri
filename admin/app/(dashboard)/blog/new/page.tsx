import type { Metadata } from "next";
import { apiServer } from "../../../../lib/api";
import { PageHeader } from "../../../../components/ui";
import PostForm, { type Category } from "../PostForm";

export const metadata: Metadata = { title: "Write an article" };

export default async function NewPostPage() {
  const { items } = await apiServer<{ items: Category[] }>("/api/admin/posts/categories");

  return (
    <>
      <PageHeader
        title="Write an article"
        description="Save as a draft while you work on it. Nothing is live until the status is Published."
      />
      <div className="max-w-3xl">
        <PostForm categories={items} />
      </div>
    </>
  );
}

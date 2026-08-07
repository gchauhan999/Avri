import type { Metadata } from "next";
import { PageHeader } from "../../../../components/ui";
import JobForm from "../JobForm";

export const metadata: Metadata = { title: "Post a role" };

export default function NewJobPage() {
  return (
    <>
      <PageHeader
        title="Post a role"
        description="Save it as a draft while you write it. Nothing is visible until the status is Open."
      />
      <div className="max-w-3xl">
        <JobForm />
      </div>
    </>
  );
}

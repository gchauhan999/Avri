import type { Metadata } from "next";
import { PageHeader } from "../../../../components/ui";
import ClientForm from "../ClientForm";

export const metadata: Metadata = { title: "Add a client" };

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Add a client"
        description="Nothing appears on the website until it is both authorised and published."
      />
      <div className="max-w-2xl">
        <ClientForm />
      </div>
    </>
  );
}

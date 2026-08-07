import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError, apiServer } from "../../../../lib/api";
import { PageHeader } from "../../../../components/ui";
import ClientForm from "../ClientForm";
import type { AdminClient } from "../page";

/** `params` is a Promise in Next 16 and must be awaited. */
type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const client = await apiServer<AdminClient>(`/api/admin/clients/${id}`);
    return { title: client.name };
  } catch {
    return { title: "Client" };
  }
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;

  let client: AdminClient;
  try {
    client = await apiServer<AdminClient>(`/api/admin/clients/${id}`);
  } catch (error) {
    // Only a genuine 404 is "not found" — anything else is a real failure and
    // should surface as an error, not a misleading 404 page.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={client.name}
        description={
          client.isPublished && client.isAuthorized
            ? "Live on the website."
            : "Not currently shown on the website."
        }
      />
      <div className="max-w-2xl">
        <ClientForm client={client} />
      </div>
    </>
  );
}

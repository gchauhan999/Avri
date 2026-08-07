import type { Metadata } from "next";
import { apiServer } from "../../../lib/api";
import { Alert, ButtonLink, EmptyState, PageHeader, TableWrap, Th } from "../../../components/ui";
import ClientRow from "./ClientRow";

export const metadata: Metadata = { title: "Clients" };

export interface AdminClient {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  logoPath: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  websiteUrl: string | null;
  sector: string | null;
  isAuthorized: boolean;
  authorizationNote: string | null;
  authorizedAt: string | null;
  isPublished: boolean;
  sortOrder: number;
}

export default async function ClientsPage() {
  const { items } = await apiServer<{ items: AdminClient[] }>("/api/admin/clients");

  const live = items.filter((c) => c.isPublished && c.isAuthorized).length;

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${items.length} on file · ${live} live on the website.`}
        action={<ButtonLink href="/clients/new">Add a client</ButtonLink>}
      />

      <div className="mb-6">
        <Alert tone="warning">
          A logo only goes live when it is both <strong>authorised</strong> and{" "}
          <strong>published</strong>. Authorised means someone holds written permission from that
          company — publishing a trademark without it is a legal risk, so the note recording how
          permission was given is required before the switch will turn on.
        </Alert>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add the organisations you have permission to name. Nothing appears on the website until you authorise and publish it."
          action={<ButtonLink href="/clients/new">Add the first client</ButtonLink>}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Logo</Th>
              <Th>Name</Th>
              <Th>Sector</Th>
              <Th>Authorised</Th>
              <Th>On the site</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}

/**
 * Reading database-backed content from the API.
 *
 * Each function carries its own cache tag, so `/api/revalidate` can drop
 * exactly what changed when something is published in the admin panel.
 */

import { apiGet } from "./api";
import type { Client } from "./types";

/**
 * Authorised, published clients only.
 *
 * The API already filters on both flags. Filtering again here is deliberate
 * belt-and-braces: showing a company's logo without permission is a trademark
 * problem, and one careless change to a SELECT should not be all that stands
 * between us and it.
 */
export async function getClients(): Promise<Client[]> {
  const clients = await apiGet<Client[]>("/api/clients", [], {
    revalidate: 1800,
    tags: ["clients"],
  });
  return clients.filter((client) => client.name);
}

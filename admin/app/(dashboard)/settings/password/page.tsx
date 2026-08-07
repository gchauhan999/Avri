import type { Metadata } from "next";
import { getSession } from "../../../../lib/session";
import { Alert, Card, PageHeader } from "../../../../components/ui";
import PasswordForm from "./PasswordForm";

export const metadata: Metadata = { title: "Change password" };

/**
 * Reachable while `mustChangePassword` is set — the dashboard layout redirects
 * here and this page is the one place that redirect leads, so a bootstrap
 * account can actually get out of it.
 */
export default async function PasswordPage() {
  const session = await getSession();
  const forced = session?.mustChangePassword ?? false;

  return (
    <>
      <PageHeader
        title="Change password"
        description="At least 12 characters. Changing it signs out every other device."
      />

      {forced ? (
        <div className="mb-6">
          <Alert tone="warning">
            This account is still on the password it was created with. Choose a new one before
            continuing.
          </Alert>
        </div>
      ) : null}

      <Card className="max-w-md p-6">
        <PasswordForm />
      </Card>
    </>
  );
}

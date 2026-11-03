import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import ChangePasswordClient from "@/app/change-password/change-password-client";

export default async function ChangePasswordPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect(ApplicationRoutes.login);
  }

  return <ChangePasswordClient />;
}

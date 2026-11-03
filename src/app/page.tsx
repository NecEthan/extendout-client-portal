import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import HomeClient from "@/app/home";

export default async function Home() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect(ApplicationRoutes.login);
  }

  if (session.user.requirePasswordChange) {
    redirect(ApplicationRoutes.changePassword);
  }

  return <HomeClient />;
}

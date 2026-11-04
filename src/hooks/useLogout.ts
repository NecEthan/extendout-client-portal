"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";

export function useLogout() {
  const router = useRouter();

  return async function logout() {
    await authClient.signOut();
    router.push(ApplicationRoutes.login);
  };
}

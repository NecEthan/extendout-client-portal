"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomeClient() {
  const router = useRouter();
  const { data: sessionData } = useSession();

  async function handleLogout() {
    await authClient.signOut();
    router.push(ApplicationRoutes.login);
  }

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-end gap-6 border-b border-border px-8 py-4">
          <button className="text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials(sessionData?.user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{sessionData?.user.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>{sessionData?.user.email}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-col gap-6 p-8" />
      </div>
    </div>
  );
}

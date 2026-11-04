"use client";

import { ChevronDown } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useLogout } from "@/hooks/useLogout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: sessionData } = useSession();
  const logout = useLogout();

  return (
    <header className="flex items-center justify-end border-b border-border px-8 py-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {sessionData?.user.name}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{sessionData?.user.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>{sessionData?.user.email}</DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

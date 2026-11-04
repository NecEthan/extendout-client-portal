"use client";

import { useSession } from "@/lib/auth-client";

export function Header() {
  const { data: sessionData } = useSession();

  return (
    <header className="flex items-center justify-end border-b border-border px-8 py-4">
      <div className="text-right">
        <p className="text-sm font-medium">{sessionData?.user.name}</p>
        <p className="text-xs text-muted-foreground">{sessionData?.user.email}</p>
      </div>
    </header>
  );
}

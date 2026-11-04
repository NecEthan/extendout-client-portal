"use client";

import { Home, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

export function Sidebar() {
  const logout = useLogout();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between bg-[#0a0a0a] px-4 py-6 text-white">
      <div>
        <div className="px-2 pb-8">
          <div className="text-xl font-extrabold tracking-tight">
            EXtend<span className="text-primary">out</span>
          </div>
          <div className="text-xs text-white/40">Client Portal</div>
        </div>

        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">
            <Home className="h-4 w-4" />
            Home
          </button>
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-2 text-sm font-medium text-white/60 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </aside>
  );
}

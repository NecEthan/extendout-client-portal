"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Home, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: ApplicationRoutes.home, icon: Home },
  { label: "Projects", href: ApplicationRoutes.projects, icon: FolderKanban },
];

function isActive(pathname: string, href: string) {
  return href === ApplicationRoutes.home ? pathname === href : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
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
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive(pathname, href)
                  ? "bg-primary text-primary-foreground"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
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

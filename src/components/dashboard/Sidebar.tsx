"use client";

import {
  Home,
  FolderKanban,
  FileText,
  PoundSterling,
  MessageSquare,
  Headset,
  User,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Documents", icon: FileText },
  { label: "Invoices", icon: PoundSterling },
  { label: "Messages", icon: MessageSquare },
  { label: "Support", icon: Headset },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
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
          <button
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
              "bg-primary text-primary-foreground",
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </button>

          <button
            className={cn(
              "flex items-center justify-between rounded-lg border border-primary/40 px-3 py-2.5 text-sm font-medium",
              "text-primary",
            )}
          >
            <span className="flex items-center gap-3">
              <FolderKanban className="h-4 w-4" />
              Projects
            </span>
            <ChevronUp className="h-4 w-4" />
          </button>

          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <Headset className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Need Help?</p>
          <p className="text-xs text-white/50">Our team is here to help.</p>
          <button className="mt-3 w-full rounded-md border border-primary/60 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
            Contact Support →
          </button>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-2 text-sm font-medium text-white/60 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

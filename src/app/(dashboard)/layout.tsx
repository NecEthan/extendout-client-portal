import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Shared shell for every page in (dashboard): sidebar + header are rendered
// here once, so pages only render their own content.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

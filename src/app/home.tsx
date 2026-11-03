"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Folder,
  FileText,
  PoundSterling,
  Headset,
  Search,
  Filter,
  Download,
  MoreVertical,
  Shield,
  Flag,
  Activity,
  FileImage,
  FileArchive,
  FileType,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { authClient, useSession } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Projects, invoices, support tickets and mock project documents below are
// placeholder data — there's no Projects/Invoices/Support backend yet, only
// Documents (used for the real stat count further down).
type ProjectStatus = "On Track" | "Planning" | "On Hold";

const statusStyles: Record<ProjectStatus, string> = {
  "On Track": "bg-green-500",
  Planning: "bg-blue-500",
  "On Hold": "bg-zinc-500",
};

const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    status: "On Track" as ProjectStatus,
    started: "12 Mar 2025",
    due: "30 Apr 2025",
    description: "A complete redesign of your website to improve performance and user experience.",
  },
  {
    id: "2",
    name: "Marketing Campaign",
    status: "Planning" as ProjectStatus,
    started: "05 Apr 2025",
    due: "31 May 2025",
    description: "Multi-channel campaign planning and asset production.",
  },
  {
    id: "3",
    name: "Brand Strategy",
    status: "On Hold" as ProjectStatus,
    started: "01 Feb 2025",
    due: "30 Jun 2025",
    description: "Brand positioning and visual identity refresh.",
  },
];

const mockProjectDocuments = [
  { name: "Project Brief.pdf", type: "PDF", size: "245 KB", uploaded: "12 Mar 2025" },
  { name: "Homepage Design (v2).png", type: "PNG", size: "1.8 MB", uploaded: "15 Mar 2025" },
  { name: "Development Handover.docx", type: "DOCX", size: "320 KB", uploaded: "20 Mar 2025" },
  { name: "Test Report.pdf", type: "PDF", size: "780 KB", uploaded: "25 Mar 2025" },
  { name: "Assets.zip", type: "ZIP", size: "12.4 MB", uploaded: "28 Mar 2025" },
];

function fileIcon(type: string) {
  if (type === "PNG") return FileImage;
  if (type === "ZIP") return FileArchive;
  if (type === "DOCX") return FileType;
  return FileText;
}

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
  const { data: documents } = useDocuments();
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0].id);
  const [docSearch, setDocSearch] = useState("");

  const selectedProject = mockProjects.find((p) => p.id === selectedProjectId) ?? mockProjects[0];
  const firstName = sessionData?.user.name?.split(" ")[0] ?? "";

  const filteredDocuments = useMemo(
    () =>
      mockProjectDocuments.filter((doc) =>
        doc.name.toLowerCase().includes(docSearch.toLowerCase()),
      ),
    [docSearch],
  );

  async function handleLogout() {
    await authClient.signOut();
    router.push(ApplicationRoutes.login);
  }

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-end gap-6 border-b border-border px-8 py-4">
          <button className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              2
            </span>
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

        <main className="flex flex-col gap-6 p-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-black p-8">
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-60"
              style={{
                background:
                  "repeating-linear-gradient(115deg, transparent, transparent 40px, var(--color-primary) 40px, var(--color-primary) 80px)",
                maskImage: "linear-gradient(to left, black, transparent)",
              }}
            />
            <h1 className="relative text-3xl font-bold">
              Welcome back, <span className="text-primary">{firstName}</span> 👋
            </h1>
            <p className="relative mt-2 text-muted-foreground">
              Here&apos;s an overview of your projects and latest updates.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Folder}
              value={mockProjects.length}
              label="Active Projects"
              linkLabel="View all projects"
            />
            <StatCard
              icon={FileText}
              value={documents?.length ?? 0}
              label="Documents"
              linkLabel="View documents"
            />
            <StatCard icon={PoundSterling} value={2} label="Open Invoices" linkLabel="View invoices" />
            <StatCard icon={Headset} value={1} label="Support Ticket" linkLabel="View support" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-bold">Projects</h2>
              <div className="flex flex-col gap-3">
                {mockProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      project.id === selectedProjectId
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-primary/40 to-zinc-800" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{project.name}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusStyles[project.status])} />
                        {project.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {project.started} • Due: {project.due}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-primary/40 to-zinc-800" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                    <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
              </div>

              <Tabs defaultValue="documents" className="mt-6">
                <TabsList>
                  <TabsTrigger value="overview">
                    <Shield className="mr-1.5 h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    <FileText className="mr-1.5 h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="milestones">
                    <Flag className="mr-1.5 h-4 w-4" />
                    Milestones
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <Activity className="mr-1.5 h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <p className="py-6 text-sm text-muted-foreground">No overview content yet.</p>
                </TabsContent>
                <TabsContent value="milestones">
                  <p className="py-6 text-sm text-muted-foreground">No milestones yet.</p>
                </TabsContent>
                <TabsContent value="activity">
                  <p className="py-6 text-sm text-muted-foreground">No activity yet.</p>
                </TabsContent>

                <TabsContent value="documents">
                  <div className="mt-2 mb-4">
                    <h3 className="font-semibold">Project Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Access all files related to this project.
                    </p>
                  </div>

                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => {
                        const Icon = fileIcon(doc.type);
                        return (
                          <TableRow key={doc.name}>
                            <TableCell className="flex items-center gap-2 font-medium">
                              <Icon className="h-4 w-4 text-primary" />
                              {doc.name}
                            </TableCell>
                            <TableCell>{doc.type}</TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>{doc.uploaded}</TableCell>
                            <TableCell className="flex items-center justify-end gap-3">
                              <span className="flex items-center gap-1 text-sm text-primary">
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </span>
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing 1–{filteredDocuments.length} of {mockProjectDocuments.length} documents
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="rounded border border-border p-1 disabled:opacity-40" disabled>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-medium text-primary-foreground">
                        1
                      </span>
                      <button className="rounded border border-border p-1 disabled:opacity-40" disabled>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  linkLabel,
}: {
  icon: typeof Folder;
  value: number;
  label: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <button className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
        {linkLabel} <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

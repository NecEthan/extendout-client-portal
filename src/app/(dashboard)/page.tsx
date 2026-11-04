import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function Home() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect(ApplicationRoutes.login);

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      documents: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </p>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No projects yet.
        </p>
      )}

      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
              {project.client.name} · Created {formatDate(project.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {project.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 truncate font-medium">{doc.fileName}</span>
                    <span className="text-muted-foreground">{formatBytes(doc.sizeBytes)}</span>
                    <span className="hidden w-28 text-muted-foreground sm:inline">{doc.uploadedBy.name}</span>
                    <span className="w-24 text-right text-muted-foreground">{formatDate(doc.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { FileText } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatDate";
import { formatBytes } from "@/lib/formatBytes";

export default function Home() {
  const { data: projects, isPending, error } = useProjects();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading projects...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </p>
      </div>

      {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}

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

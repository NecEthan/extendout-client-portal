"use client";

import { FileText } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/formatDate";

export default function ProjectsPage() {
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

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Documents</th>
                <th className="px-4 py-3 text-right font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3 font-medium">{project.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {project.documents.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(project.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

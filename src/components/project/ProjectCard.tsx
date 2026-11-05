import Link from "next/link";
import { FileText } from "lucide-react";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { formatDate } from "@/lib/formatDate";
import type { Project } from "@/interfaces/project-interface";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={ApplicationRoutes.project(project.id)}
      className="flex aspect-square flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-muted/50"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{project.name}</h2>
        <p className="text-sm text-muted-foreground">Created {formatDate(project.createdAt)}</p>
      </div>
      <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <FileText className="h-4 w-4 text-primary" />
        <span data-testid="document-count">
          {project.documents.length} document{project.documents.length === 1 ? "" : "s"}
        </span>
      </p>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useProjects } from "@/hooks/useProjects";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { apiErrorMessage } from "@/lib/apiErrorMessage";
import { formatDate } from "@/lib/formatDate";
import type { IdParam } from "@/types/idParam-type";

export default function ProjectPage() {
  const { id } = useParams<IdParam>();
  const { data: project, isPending, error } = useProject(id);
  const { data: allProjects } = useProjects();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading project...</p>;
  }

  if (error) {
    return (
      <div className="flex max-w-4xl flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{apiErrorMessage(error)}</AlertDescription>
        </Alert>
        <Link href={ApplicationRoutes.projects} className="text-sm text-muted-foreground hover:text-foreground">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        {allProjects && (
          <Link
            href={ApplicationRoutes.projects}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">Created {formatDate(project.createdAt)}</p>
        </div>
      </div>

      <ProjectTabs project={project} />
    </div>
  );
}

"use client";

import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiErrorMessage } from "@/lib/apiErrorMessage";

export default function ProjectsPage() {
  const { data: projects, isPending, error } = useProjects();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading projects...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{apiErrorMessage(error)}</AlertDescription>
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
        <ul className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

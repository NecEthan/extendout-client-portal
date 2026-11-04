import type { ProjectDocument } from "@/interfaces/project-document-interface";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  documents: ProjectDocument[];
}

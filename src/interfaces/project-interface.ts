import type { ProjectDocument } from "@/interfaces/project-document-interface";

export interface Project {
  id: string;
  name: string;
  clientId: string;
  createdAt: string;
  client: { name: string };
  documents: ProjectDocument[];
}

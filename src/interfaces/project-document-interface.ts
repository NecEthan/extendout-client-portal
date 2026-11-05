export interface ProjectDocument {
  id: string;
  fileName: string;
  storageKey: string;
  status: "PENDING" | "READY";
  mimeType: string;
  sizeBytes: number;
  projectId: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: { name: string };
}

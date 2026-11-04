export interface ProjectDocument {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  projectId: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: { name: string };
}

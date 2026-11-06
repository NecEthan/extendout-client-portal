export interface ProjectPhoto {
  id: string;
  fileName: string;
  // Short-lived presigned URL; the bucket is private.
  url: string;
  createdAt: string;
  uploadedBy: { name: string };
}

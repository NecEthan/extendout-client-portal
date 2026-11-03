"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRoutes } from "@/lib/apiRoutes";

export interface Document {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  projectId: string;
  uploadedById: string;
  createdAt: string;
}

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<Document[]> => {
      const res = await fetch(ApiRoutes.documents);
      if (!res.ok) throw new Error("Failed to load documents");
      return res.json();
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<Document> => {
      const res = await fetch(ApiRoutes.documents, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

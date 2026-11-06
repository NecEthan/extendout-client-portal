"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiRoutes } from "@/lib/apiRoutes";
import type {
  RequestDocumentUploadResponse,
} from "@/interfaces/document-upload-interface";
import type { ProjectDocument } from "@/interfaces/project-document-interface";
import type { DocumentType } from "@/types/documentType-type";

// Upload = 3 requests: ask our API for a presigned URL, PUT the file straight to the bucket,
// then tell our API it's done so it can verify the file and mark it READY.
// `type` decides which tab it shows up in (Documents or Photos).
export function useUploadDocument(projectId: string, type: DocumentType = "DOCUMENT") {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress(0);
      const mimeType = file.type || "application/octet-stream";

      const payload = { fileName: file.name, mimeType, sizeBytes: file.size, type };
      const { data: upload } = await axios.post<RequestDocumentUploadResponse>(
        ApiRoutes.projects.requestDocumentUpload(projectId),
        payload,
      );

      await axios.put(upload.uploadUrl, file, {
        headers: { "Content-Type": mimeType },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      const { data } = await axios.post<ProjectDocument>(ApiRoutes.documents.completeUpload(upload.documentId));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return { ...mutation, progress };
}

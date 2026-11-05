"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiRoutes } from "@/lib/apiRoutes";
import type {
  RequestDocumentUploadResponse,
} from "@/interfaces/document-upload-interface";
import type { ProjectDocument } from "@/interfaces/project-document-interface";

// Upload = 3 requests: ask our API for a presigned URL, PUT the file straight to the bucket,
// then tell our API it's done so it can verify the file and mark it READY.
export function useUploadDocument(projectId: string) {
  const queryClient = useQueryClient();
  // 0–100 while the file is being sent to the bucket
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress(0);
      const mimeType = file.type || "application/octet-stream";

      const payload = { fileName: file.name, mimeType, sizeBytes: file.size };
      const { data: upload } = await axios.post<RequestDocumentUploadResponse>(
        ApiRoutes.projects.requestDocumentUpload(projectId),
        payload,
      );

      // Must match the content type the URL was signed with.
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
      // ["projects"] prefix also covers ["projects", projectId]
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return { ...mutation, progress };
}

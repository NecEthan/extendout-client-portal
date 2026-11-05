"use client";

import { useState, type SubmitEvent } from "react";
import { FileText, Upload } from "lucide-react";
import { useUploadDocument } from "@/hooks/useUploadDocument";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/apiErrorMessage";
import { formatBytes } from "@/lib/formatBytes";
import { formatDate } from "@/lib/formatDate";
import { MAX_FILE_BYTES } from "@/lib/uploadConfig";
import type { Project } from "@/interfaces/project-interface";
import type { ProjectDocument } from "@/interfaces/project-document-interface";

function UploadDocumentForm({ projectId }: { projectId: string }) {
  const uploadDocument = useUploadDocument(projectId);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const tooLarge = file !== null && file.size > MAX_FILE_BYTES;

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || tooLarge) return;

    setUploadedFileName(null);
    uploadDocument.mutate(file, {
      onSuccess: () => {
        setUploadedFileName(file.name);
        setFile(null);
        setFileInputKey((key) => key + 1);
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a document</CardTitle>
        <CardDescription>Max 100 MB. Everyone on this project will be able to see it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              key={fileInputKey}
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>

          {tooLarge && (
            <Alert variant="destructive">
              <AlertDescription>File is too large (max 100 MB).</AlertDescription>
            </Alert>
          )}

          {uploadDocument.error && (
            <Alert variant="destructive">
              <AlertDescription>{apiErrorMessage(uploadDocument.error)}</AlertDescription>
            </Alert>
          )}

          {uploadedFileName && (
            <p role="status" className="text-sm text-muted-foreground">
              Uploaded {uploadedFileName}.
            </p>
          )}

          <Button type="submit" disabled={uploadDocument.isPending || !file || tooLarge} className="self-start">
            <Upload />
            {uploadDocument.isPending ? `Uploading... ${uploadDocument.progress}%` : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DocumentsTable({ documents }: { documents: ProjectDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">File</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Uploaded by</th>
            <th className="px-4 py-3 text-right font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {doc.fileName}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatBytes(doc.sizeBytes)}</td>
              <td className="px-4 py-3 text-muted-foreground">{doc.uploadedBy.name}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(doc.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocumentsTab({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-6">
      <DocumentsTable documents={project.documents} />
      <UploadDocumentForm projectId={project.id} />
    </div>
  );
}

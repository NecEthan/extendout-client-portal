"use client";

import { FileText } from "lucide-react";
import { formatBytes } from "@/lib/formatBytes";
import { formatDate } from "@/lib/formatDate";
import type { Project } from "@/interfaces/project-interface";
import type { ProjectDocument } from "@/interfaces/project-document-interface";

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
  return <DocumentsTable documents={project.documents} />;
}

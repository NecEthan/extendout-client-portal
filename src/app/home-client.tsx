"use client";

import { useRef, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useDocuments, useUploadDocument } from "@/hooks/useDocuments";
import { authClient, useSession } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomeClient() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { data: documents, isLoading, isError } = useDocuments();
  const uploadMutation = useUploadDocument();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleLogout() {
    await authClient.signOut();
    router.push(ApplicationRoutes.login);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    uploadMutation.mutate(formData, {
      onSuccess: () => formRef.current?.reset(),
    });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Client Portal</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {sessionData?.user.email} ({sessionData?.user.portalRole})
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex items-center gap-3">
            <Input type="file" name="file" required className="max-w-xs" />
            <input type="hidden" name="projectId" value="" />
            <input type="hidden" name="uploadedById" value="" />
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {isError && <p className="text-sm text-destructive">Failed to load documents.</p>}
          <ul className="flex flex-col gap-2">
            {documents?.map((doc) => (
              <li key={doc.id} className="text-sm">
                {doc.fileName} ({doc.sizeBytes} bytes)
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import { useRef, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useDocuments, useUploadDocument } from "@/hooks/useDocuments";
import { authClient, useSession } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between bg-[#0a0a0a] px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            Extend<span className="text-primary">Out</span>
          </span>
          <span className="hidden text-sm text-white/50 sm:inline">Client Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/70">{sessionData?.user.email}</span>
            <Badge className="bg-primary text-primary-foreground">
              {sessionData?.user.portalRole}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total documents</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? <Skeleton className="h-8 w-12" /> : (documents?.length ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Account</CardDescription>
              <CardTitle className="truncate text-xl">{sessionData?.user.name}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardDescription>Role</CardDescription>
              <CardTitle className="text-xl text-primary">
                {sessionData?.user.portalRole}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload document</CardTitle>
            <CardDescription>Add a file to this project.</CardDescription>
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
            {isError && <p className="text-sm text-destructive">Failed to load documents.</p>}
            {isLoading && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
            {!isLoading && documents?.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}
            {!isLoading && documents && documents.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.fileName}</TableCell>
                      <TableCell>{formatBytes(doc.sizeBytes)}</TableCell>
                      <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

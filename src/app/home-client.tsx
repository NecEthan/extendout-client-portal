"use client";

import { useRef, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useDocuments, useUploadDocument } from "@/hooks/useDocuments";
import { authClient, useSession } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";

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
    <main style={{ padding: 32, maxWidth: 640, margin: "0 auto" }}>
      <h1>Client Portal</h1>
      <p>
        Signed in as {sessionData?.user.email} ({sessionData?.user.portalRole})
        {" "}
        <button onClick={handleLogout}>Log out</button>
      </p>

      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="file" name="file" required />
        <input type="hidden" name="projectId" value="" />
        <input type="hidden" name="uploadedById" value="" />
        <button type="submit" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading..." : "Upload document"}
        </button>
      </form>

      <h2>Documents</h2>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Failed to load documents.</p>}
      <ul>
        {documents?.map((doc) => (
          <li key={doc.id}>
            {doc.fileName} ({doc.sizeBytes} bytes)
          </li>
        ))}
      </ul>
    </main>
  );
}

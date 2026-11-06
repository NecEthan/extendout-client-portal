"use client";

import { useState, type SubmitEvent } from "react";
import { ImagePlus } from "lucide-react";
import { useUploadDocument } from "@/hooks/useUploadDocument";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/apiErrorMessage";
import { invalidPhotoMessage } from "@/lib/invalidPhotoMessage";
import { PHOTO_MIME_TYPES } from "@/lib/uploadConfig";

export function UploadPhotosForm({ projectId }: { projectId: string }) {
  const uploadPhoto = useUploadDocument(projectId, "PHOTO");
  const [files, setFiles] = useState<File[]>([]);
  // Remounts the file input to clear it; browsers don't let code reset a file input's value.
  const [fileInputKey, setFileInputKey] = useState(0);
  // 1-based index of the photo currently uploading, null when idle
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);
  const invalidMessage = invalidPhotoMessage(files);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0 || invalidMessage) return;

    setUploadedCount(null);
    let uploaded = 0;
    try {
      // One at a time: keeps progress readable and stops at the first failure.
      for (const [index, file] of files.entries()) {
        setUploadingIndex(index + 1);
        await uploadPhoto.mutateAsync(file);
        uploaded += 1;
      }
      setFiles([]);
      setFileInputKey((key) => key + 1);
    } catch {
      // Shown below via uploadPhoto.error
    } finally {
      setUploadingIndex(null);
      setUploadedCount(uploaded > 0 ? uploaded : null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload photos</CardTitle>
        <CardDescription>
          JPEG, PNG, WebP or GIF, max 100 MB each. Everyone on this project will be able to see them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="photos">Photos</Label>
            <Input
              key={fileInputKey}
              id="photos"
              type="file"
              accept={PHOTO_MIME_TYPES.join(",")}
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              required
            />
          </div>

          {invalidMessage && (
            <Alert variant="destructive">
              <AlertDescription>{invalidMessage}</AlertDescription>
            </Alert>
          )}

          {uploadPhoto.error && (
            <Alert variant="destructive">
              <AlertDescription>{apiErrorMessage(uploadPhoto.error)}</AlertDescription>
            </Alert>
          )}

          {uploadedCount !== null && (
            <p role="status" className="text-sm text-muted-foreground">
              Uploaded {uploadedCount} {uploadedCount === 1 ? "photo" : "photos"}.
            </p>
          )}

          <Button
            type="submit"
            disabled={uploadingIndex !== null || files.length === 0 || invalidMessage !== null}
            className="self-start"
          >
            <ImagePlus />
            {uploadingIndex !== null
              ? `Uploading ${uploadingIndex} of ${files.length}... ${uploadPhoto.progress}%`
              : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { usePhotos } from "@/hooks/usePhotos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhotoGrid } from "@/components/project/PhotoGrid";
import { UploadPhotosForm } from "@/components/project/UploadPhotosForm";
import { apiErrorMessage } from "@/lib/apiErrorMessage";

export function PhotosTab({ projectId }: { projectId: string }) {
  const { data: photos, isPending, error } = usePhotos(projectId);

  return (
    <div className="flex flex-col gap-6">
      {isPending && <p className="text-sm text-muted-foreground">Loading photos...</p>}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{apiErrorMessage(error)}</AlertDescription>
        </Alert>
      )}
      {photos && <PhotoGrid photos={photos} />}
      <UploadPhotosForm projectId={projectId} />
    </div>
  );
}

import "server-only";
import { ApiError } from "@/lib/apiResponse";
import { PHOTO_MIME_TYPES } from "@/lib/uploadConfig";
import type { DocumentType } from "@/types/documentType-type";

// Checks the body of step 1 of an upload (POST /api/projects/[id]/documents) and returns its
// fields typed. Throws ApiError(400) for anything the UI would never send, since the API can be
// called directly.
export function validateUploadRequest(body: unknown) {
  const { fileName, mimeType, sizeBytes, type = "DOCUMENT" } = (body ?? {}) as Record<string, unknown>;

  if (typeof fileName !== "string" || fileName.trim() === "" || fileName.length > 255) {
    throw new ApiError(400, "fileName is required (max 255 and min 1 characters)");
  }
  if (typeof mimeType !== "string") {
    throw new ApiError(400, "mimeType is required");
  }
  if (typeof sizeBytes !== "number" || !Number.isInteger(sizeBytes) || sizeBytes <= 0) {
    throw new ApiError(400, "File is empty");
  }
  if (type !== "DOCUMENT" && type !== "PHOTO") {
    throw new ApiError(400, 'type must be "DOCUMENT" or "PHOTO"');
  }
  // The upload URL is signed with this content type, so the bucket stores and serves it as an image.
  if (type === "PHOTO" && !PHOTO_MIME_TYPES.includes(mimeType)) {
    throw new ApiError(400, "Photos must be JPEG, PNG, WebP or GIF images");
  }

  const documentType: DocumentType = type;
  return { fileName, mimeType, sizeBytes, type: documentType };
}

import { MAX_FILE_BYTES, PHOTO_MIME_TYPES } from "@/lib/uploadConfig";

// Early feedback in the upload form; the server enforces the same rules.
// Returns an error message for the selected files, or null if they're all fine.
export function invalidPhotoMessage(files: File[]) {
  const notImages = files.filter((file) => !PHOTO_MIME_TYPES.includes(file.type));
  if (notImages.length > 0) {
    return `Not a supported image (JPEG, PNG, WebP or GIF): ${notImages.map((file) => file.name).join(", ")}`;
  }
  const tooLarge = files.filter((file) => file.size > MAX_FILE_BYTES);
  if (tooLarge.length > 0) {
    return `Too large (max 100 MB): ${tooLarge.map((file) => file.name).join(", ")}`;
  }
  return null;
}

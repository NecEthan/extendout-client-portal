// Shared by the server (enforced in uploadLimits.ts) and the upload form (early feedback).
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

// Image types every browser can display. HEIC (iPhone) isn't one, but iOS converts to JPEG when
// picking from the photo library through a file input.
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

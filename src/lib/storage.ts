import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3-compatible object storage: MinIO locally (docker-compose.dev.yml), Backblaze B2 in prod.
// The bucket is private; the browser only ever gets short-lived presigned URLs.

const UPLOAD_URL_TTL_SECONDS = 10 * 60;
const VIEW_URL_TTL_SECONDS = 60 * 60;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}`);
  }
  return value;
}

const BUCKET = requireEnv("S3_BUCKET");

function createClient(endpoint: string) {
  return new S3Client({
    endpoint,
    region: requireEnv("S3_REGION"),
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
    // Newer SDKs add CRC checksum params to presigned PUTs by default, which browsers
    // can't satisfy and B2 doesn't support. Only send checksums when an operation requires them.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

// Server → bucket calls (inside docker this is http://minio:9000).
const internalClient = createClient(requireEnv("S3_ENDPOINT"));
// Only used to sign URLs for the browser. Signing is offline, but the host is part of the
// signature, so it must be the host the browser uses (http://localhost:9000 in dev).
const publicClient = createClient(process.env.S3_PUBLIC_ENDPOINT ?? requireEnv("S3_ENDPOINT"));

// Presigned PUT locked to this key, content type and exact size.
export async function createUploadUrl(key: string, mimeType: string, sizeBytes: number) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
    ContentLength: sizeBytes,
  });
  return getSignedUrl(publicClient, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
    signableHeaders: new Set(["content-type", "content-length"]),
  });
}

// Presigned GET for viewing a file (e.g. a photo in an <img>). Only hand these out after an
// access check: anyone holding the URL can open the file until it expires.
export async function createViewUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(publicClient, command, { expiresIn: VIEW_URL_TTL_SECONDS });
}

// Size of a stored object, or null if it doesn't exist.
export async function getObjectSize(key: string) {
  try {
    const head = await internalClient.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return head.ContentLength ?? null;
  } catch (error) {
    if (error instanceof Error && (error.name === "NotFound" || error.name === "NoSuchKey")) {
      return null;
    }
    throw error;
  }
}

export async function deleteObject(key: string) {
  await internalClient.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'READY');

-- Files now live in an object-storage bucket; filePath becomes the object key.
-- Renamed (not dropped) so existing rows keep their value.
ALTER TABLE "Document" RENAME COLUMN "filePath" TO "storageKey";

-- Existing documents are already complete, so backfill them as READY,
-- then make PENDING the default for new uploads.
ALTER TABLE "Document" ADD COLUMN "status" "DocumentStatus" NOT NULL DEFAULT 'READY';
ALTER TABLE "Document" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

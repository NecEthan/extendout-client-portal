-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DOCUMENT', 'PHOTO');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "type" "DocumentType" NOT NULL DEFAULT 'DOCUMENT';

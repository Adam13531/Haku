-- AddExtension
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "name" SET DATA TYPE CITEXT;
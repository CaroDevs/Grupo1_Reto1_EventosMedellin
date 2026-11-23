-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED');

-- DropIndex
DROP INDEX "activities_location_idx";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "status" "ActivityStatus" NOT NULL DEFAULT 'DRAFT';

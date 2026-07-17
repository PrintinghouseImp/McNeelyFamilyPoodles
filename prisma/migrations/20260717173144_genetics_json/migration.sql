-- AlterTable
ALTER TABLE "ParentDog" ADD COLUMN     "geneticsData" JSONB;

-- AlterTable
ALTER TABLE "Puppy" ADD COLUMN     "genetics" TEXT,
ADD COLUMN     "geneticsData" JSONB;

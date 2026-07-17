-- AlterTable
ALTER TABLE "Puppy" ADD COLUMN     "isAdopted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Puppy_isAdopted_isPublished_idx" ON "Puppy"("isAdopted", "isPublished");

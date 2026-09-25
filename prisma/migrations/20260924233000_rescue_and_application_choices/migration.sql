-- CreateEnum
CREATE TYPE "ApplicationIntent" AS ENUM ('PUPPY', 'GUARDIAN');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "intent" "ApplicationIntent" NOT NULL DEFAULT 'PUPPY';
ALTER TABLE "Application" ADD COLUMN "secondPuppyId" TEXT;

-- CreateIndex
CREATE INDEX "Application_secondPuppyId_idx" ON "Application"("secondPuppyId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_secondPuppyId_fkey" FOREIGN KEY ("secondPuppyId") REFERENCES "Puppy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "RescueApplication" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "ein" TEXT NOT NULL,
    "confirms501c3" BOOLEAN NOT NULL,
    "focus" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RescueApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RescueApplication_createdAt_idx" ON "RescueApplication"("createdAt");

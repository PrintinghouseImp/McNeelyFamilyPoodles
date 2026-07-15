-- CreateTable
CREATE TABLE "ForeverHome" (
    "id" TEXT NOT NULL,
    "dogName" TEXT NOT NULL,
    "familyName" TEXT,
    "quote" TEXT NOT NULL,
    "photoUrl" TEXT,
    "location" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "placedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForeverHome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForeverHome_isPublished_sortOrder_idx" ON "ForeverHome"("isPublished", "sortOrder");

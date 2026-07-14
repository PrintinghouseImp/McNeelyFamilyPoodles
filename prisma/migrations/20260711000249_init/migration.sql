-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PuppyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'GUARDIANSHIP', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "PhotoEntity" AS ENUM ('PARENT', 'PUPPY', 'LITTER', 'ARTICLE', 'SHOP', 'SITE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('VET_RECORD', 'VACCINATION', 'PEDIGREE', 'AKC', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'APPROVED', 'DECLINED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "DepositMethod" AS ENUM ('VENMO', 'ZELLE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('REQUESTED', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ShopItemType" AS ENUM ('AFFILIATE', 'PRODUCT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ParentDog" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "color" TEXT,
    "weightLbs" DOUBLE PRECISION,
    "heightInches" DOUBLE PRECISION,
    "genetics" TEXT,
    "description" TEXT,
    "isRetired" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentDog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Litter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "damId" TEXT NOT NULL,
    "sireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Litter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puppy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "color" TEXT,
    "status" "PuppyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "priceCents" INTEGER,
    "priceLabel" TEXT,
    "description" TEXT,
    "birthDate" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "litterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puppy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "entityType" "PhotoEntity" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "parentDogId" TEXT,
    "puppyId" TEXT,
    "litterId" TEXT,
    "articleId" TEXT,
    "shopItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3),
    "notes" TEXT,
    "fileUrl" TEXT,
    "parentDogId" TEXT,
    "puppyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DogOwnership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "puppyId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "DogOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DogDocument" (
    "id" TEXT NOT NULL,
    "puppyId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isPaidUpgrade" BOOLEAN NOT NULL DEFAULT false,
    "isVisibleToOwner" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DogDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "puppyId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "homeType" TEXT,
    "hasKids" BOOLEAN,
    "hasPets" BOOLEAN,
    "answers" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "puppyId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "method" "DepositMethod" NOT NULL,
    "amountCents" INTEGER,
    "status" "DepositStatus" NOT NULL DEFAULT 'REQUESTED',
    "customerNote" TEXT,
    "adminNote" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ShopItemType" NOT NULL DEFAULT 'AFFILIATE',
    "url" TEXT,
    "priceCents" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "caption" TEXT,
    "imageUrl" TEXT,
    "postedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ParentDog_slug_key" ON "ParentDog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Litter_slug_key" ON "Litter"("slug");

-- CreateIndex
CREATE INDEX "Litter_birthDate_idx" ON "Litter"("birthDate");

-- CreateIndex
CREATE INDEX "Litter_damId_idx" ON "Litter"("damId");

-- CreateIndex
CREATE INDEX "Litter_sireId_idx" ON "Litter"("sireId");

-- CreateIndex
CREATE UNIQUE INDEX "Puppy_slug_key" ON "Puppy"("slug");

-- CreateIndex
CREATE INDEX "Puppy_status_isPublished_idx" ON "Puppy"("status", "isPublished");

-- CreateIndex
CREATE INDEX "Puppy_litterId_idx" ON "Puppy"("litterId");

-- CreateIndex
CREATE INDEX "Photo_parentDogId_idx" ON "Photo"("parentDogId");

-- CreateIndex
CREATE INDEX "Photo_puppyId_idx" ON "Photo"("puppyId");

-- CreateIndex
CREATE INDEX "Photo_litterId_idx" ON "Photo"("litterId");

-- CreateIndex
CREATE INDEX "Photo_articleId_idx" ON "Photo"("articleId");

-- CreateIndex
CREATE INDEX "Photo_shopItemId_idx" ON "Photo"("shopItemId");

-- CreateIndex
CREATE INDEX "MedicalRecord_parentDogId_idx" ON "MedicalRecord"("parentDogId");

-- CreateIndex
CREATE INDEX "MedicalRecord_puppyId_idx" ON "MedicalRecord"("puppyId");

-- CreateIndex
CREATE INDEX "DogOwnership_userId_idx" ON "DogOwnership"("userId");

-- CreateIndex
CREATE INDEX "DogOwnership_puppyId_idx" ON "DogOwnership"("puppyId");

-- CreateIndex
CREATE UNIQUE INDEX "DogOwnership_userId_puppyId_key" ON "DogOwnership"("userId", "puppyId");

-- CreateIndex
CREATE INDEX "DogDocument_puppyId_type_idx" ON "DogDocument"("puppyId", "type");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_puppyId_idx" ON "Application"("puppyId");

-- CreateIndex
CREATE INDEX "DepositRequest_status_createdAt_idx" ON "DepositRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DepositRequest_userId_idx" ON "DepositRequest"("userId");

-- CreateIndex
CREATE INDEX "DepositRequest_puppyId_idx" ON "DepositRequest"("puppyId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_isPublished_publishedAt_idx" ON "Article"("isPublished", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_slug_key" ON "ShopItem"("slug");

-- CreateIndex
CREATE INDEX "ShopItem_isPublished_sortOrder_idx" ON "ShopItem"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "SocialPost_isPublished_sortOrder_idx" ON "SocialPost"("isPublished", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_damId_fkey" FOREIGN KEY ("damId") REFERENCES "ParentDog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "ParentDog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puppy" ADD CONSTRAINT "Puppy_litterId_fkey" FOREIGN KEY ("litterId") REFERENCES "Litter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_parentDogId_fkey" FOREIGN KEY ("parentDogId") REFERENCES "ParentDog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_litterId_fkey" FOREIGN KEY ("litterId") REFERENCES "Litter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_parentDogId_fkey" FOREIGN KEY ("parentDogId") REFERENCES "ParentDog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DogOwnership" ADD CONSTRAINT "DogOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DogOwnership" ADD CONSTRAINT "DogOwnership_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DogDocument" ADD CONSTRAINT "DogDocument_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositRequest" ADD CONSTRAINT "DepositRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositRequest" ADD CONSTRAINT "DepositRequest_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

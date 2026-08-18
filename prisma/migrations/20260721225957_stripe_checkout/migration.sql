-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('DEPOSIT', 'FULL');

-- CreateEnum
CREATE TYPE "PaymentCheckoutStatus" AS ENUM ('OPEN', 'COMPLETE', 'EXPIRED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "DepositMethod" ADD VALUE 'STRIPE';

-- CreateTable
CREATE TABLE "PaymentCheckout" (
    "id" TEXT NOT NULL,
    "kind" "PaymentKind" NOT NULL,
    "status" "PaymentCheckoutStatus" NOT NULL DEFAULT 'OPEN',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "description" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "puppyId" TEXT,
    "userId" TEXT,
    "depositRequestId" TEXT,
    "createdByUserId" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "checkoutUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCheckout_depositRequestId_key" ON "PaymentCheckout"("depositRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCheckout_stripeSessionId_key" ON "PaymentCheckout"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PaymentCheckout_status_createdAt_idx" ON "PaymentCheckout"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentCheckout_userId_idx" ON "PaymentCheckout"("userId");

-- CreateIndex
CREATE INDEX "PaymentCheckout_puppyId_idx" ON "PaymentCheckout"("puppyId");

-- CreateIndex
CREATE INDEX "PaymentCheckout_kind_status_idx" ON "PaymentCheckout"("kind", "status");

-- AddForeignKey
ALTER TABLE "PaymentCheckout" ADD CONSTRAINT "PaymentCheckout_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCheckout" ADD CONSTRAINT "PaymentCheckout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCheckout" ADD CONSTRAINT "PaymentCheckout_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCheckout" ADD CONSTRAINT "PaymentCheckout_depositRequestId_fkey" FOREIGN KEY ("depositRequestId") REFERENCES "DepositRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

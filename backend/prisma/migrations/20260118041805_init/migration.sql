/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `Prescription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `qrExpiresAt` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrToken` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_userId_fkey";

-- AlterTable
ALTER TABLE "DosageForms" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 500;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "anonymousName" TEXT,
ADD COLUMN     "qrExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "qrToken" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "pharmacistId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PAID',

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_qrToken_key" ON "Prescription"("qrToken");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("prescriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The values [COMPLETED] on the enum `PrescriptionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('APPOINTMENT', 'LAB_TEST', 'PHARMACY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'READY');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('NORMAL', 'URGENT');

-- AlterEnum
BEGIN;
CREATE TYPE "PrescriptionStatus_new" AS ENUM ('PENDING', 'VERIFIED', 'READY', 'DISPENSED', 'REJECTED');
ALTER TABLE "Prescription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Prescription" ALTER COLUMN "status" TYPE "PrescriptionStatus_new" USING ("status"::text::"PrescriptionStatus_new");
ALTER TYPE "PrescriptionStatus" RENAME TO "PrescriptionStatus_old";
ALTER TYPE "PrescriptionStatus_new" RENAME TO "PrescriptionStatus";
DROP TYPE "PrescriptionStatus_old";
ALTER TABLE "Prescription" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "Bill" (
    "billId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "type" "BillType" NOT NULL,
    "description" VARCHAR(200),
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidDate" TIMESTAMP(3),

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("billId")
);

-- CreateTable
CREATE TABLE "LabReport" (
    "reportId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "testType" VARCHAR(200) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "PriorityLevel" NOT NULL DEFAULT 'NORMAL',
    "results" TEXT,
    "notes" TEXT,
    "orderedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("reportId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_invoiceNumber_key" ON "Bill"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE SET NULL ON UPDATE CASCADE;

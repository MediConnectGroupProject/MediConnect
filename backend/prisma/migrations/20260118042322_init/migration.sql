-- AlterTable
ALTER TABLE "InventoryLogs" ADD COLUMN     "prescriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "InventoryLogs" ADD CONSTRAINT "InventoryLogs_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("prescriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `expiryDate` on table `InventoryLogs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InventoryLogs" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "expiryDate" SET NOT NULL;

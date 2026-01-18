/*
  Warnings:

  - Added the required column `nic` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "nic" VARCHAR(12) NOT NULL;

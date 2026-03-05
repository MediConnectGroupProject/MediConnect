-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "hospitals" JSONB,
ADD COLUMN     "proficiency" JSONB,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "workingHours" JSONB;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodType" VARCHAR(10),
ADD COLUMN     "conditions" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "nic" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "hospitalName" TEXT NOT NULL DEFAULT 'MediConnect Hospital',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@mediconnect.com',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

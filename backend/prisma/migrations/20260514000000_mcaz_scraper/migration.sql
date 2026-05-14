-- AlterTable: add MCAZ fields to Medicine
ALTER TABLE "Medicine" ADD COLUMN "requiresPrescription" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Medicine" ADD COLUMN "otcAllowed" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "Medicine" ADD COLUMN "mcazRegistered" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Medicine" ADD COLUMN "mcazRegNumber" TEXT;
ALTER TABLE "Medicine" ADD COLUMN "mcazSchedule" TEXT;

-- AlterTable: add license fields to Pharmacy
ALTER TABLE "Pharmacy" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN "licenseExpiry" DATETIME;
ALTER TABLE "Pharmacy" ADD COLUMN "licenseValid" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "Pharmacy" ADD COLUMN "mcazVerified" BOOLEAN NOT NULL DEFAULT FALSE;

-- AlterTable: add prescriptionId to CartItem
ALTER TABLE "CartItem" ADD COLUMN "prescriptionId" TEXT;

-- CreateTable: Prescription
CREATE TABLE "Prescription" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "userId"     TEXT,
    "medicineId" TEXT,
    "fileUrl"    TEXT NOT NULL,
    "status"     TEXT NOT NULL DEFAULT 'pending',
    "verifiedAt" DATETIME,
    "expiresAt"  DATETIME,
    "notes"      TEXT,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prescription_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateForeignKey: CartItem.prescriptionId -> Prescription.id
-- (SQLite does not support ADD CONSTRAINT after table creation, so we rely on Prisma's FK emulation)

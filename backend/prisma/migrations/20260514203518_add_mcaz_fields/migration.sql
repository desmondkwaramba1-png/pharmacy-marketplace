-- CreateTable
CREATE TABLE "McazPremise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licenseNumber" TEXT NOT NULL,
    "premiseName" TEXT NOT NULL,
    "physicalAddress" TEXT NOT NULL,
    "city" TEXT,
    "pharmacistInCharge" TEXT,
    "licenseStatus" TEXT NOT NULL DEFAULT 'Active',
    "expiryDate" TEXT,
    "lastScrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "McazMedicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "genericName" TEXT,
    "strengthForm" TEXT,
    "distributionCategory" TEXT NOT NULL DEFAULT 'OTC',
    "applicantHolder" TEXT,
    "lastScrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "McazPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "qualification" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastScrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScraperLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rowsFound" INTEGER NOT NULL DEFAULT 0,
    "errorMsg" TEXT,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "reservedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "genericName" TEXT NOT NULL,
    "brandName" TEXT,
    "dosage" TEXT,
    "form" TEXT,
    "category" TEXT,
    "description" TEXT,
    "standardPrice" REAL,
    "imageUrl" TEXT,
    "mcazRegNumber" TEXT,
    "distributionCategory" TEXT,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
    "advertisingClass" TEXT,
    "isMcazVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Medicine" ("brandName", "category", "createdAt", "description", "dosage", "form", "genericName", "id", "imageUrl", "standardPrice", "updatedAt") SELECT "brandName", "category", "createdAt", "description", "dosage", "form", "genericName", "id", "imageUrl", "standardPrice", "updatedAt" FROM "Medicine";
DROP TABLE "Medicine";
ALTER TABLE "new_Medicine" RENAME TO "Medicine";
CREATE TABLE "new_Pharmacy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Harare',
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "operatingHours" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT,
    "mcazLicenseNumber" TEXT,
    "mcazVerified" BOOLEAN NOT NULL DEFAULT false,
    "mcazVerifiedAt" DATETIME,
    "mcazSuspended" BOOLEAN NOT NULL DEFAULT false,
    "mcazSuspendReason" TEXT,
    "marketplaceStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pharmacy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pharmacy" ("address", "city", "createdAt", "email", "id", "isActive", "latitude", "logoUrl", "longitude", "name", "operatingHours", "ownerId", "phone", "suburb", "updatedAt") SELECT "address", "city", "createdAt", "email", "id", "isActive", "latitude", "logoUrl", "longitude", "name", "operatingHours", "ownerId", "phone", "suburb", "updatedAt" FROM "Pharmacy";
DROP TABLE "Pharmacy";
ALTER TABLE "new_Pharmacy" RENAME TO "Pharmacy";
CREATE UNIQUE INDEX "Pharmacy_ownerId_key" ON "Pharmacy"("ownerId");
CREATE TABLE "new_PharmacyInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pharmacyId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "stockStatus" TEXT NOT NULL DEFAULT 'in_stock',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "price" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "PharmacyInventory_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PharmacyInventory_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PharmacyInventory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PharmacyInventory" ("id", "lastUpdated", "medicineId", "pharmacyId", "price", "quantity", "stockStatus", "updatedById") SELECT "id", "lastUpdated", "medicineId", "pharmacyId", "price", "quantity", "stockStatus", "updatedById" FROM "PharmacyInventory";
DROP TABLE "PharmacyInventory";
ALTER TABLE "new_PharmacyInventory" RENAME TO "PharmacyInventory";
CREATE UNIQUE INDEX "PharmacyInventory_pharmacyId_medicineId_key" ON "PharmacyInventory"("pharmacyId", "medicineId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "McazPremise_licenseNumber_key" ON "McazPremise"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "McazMedicine_registrationNumber_key" ON "McazMedicine"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "McazPerson_registrationNumber_key" ON "McazPerson"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_pharmacyId_medicineId_key" ON "CartItem"("cartId", "pharmacyId", "medicineId");

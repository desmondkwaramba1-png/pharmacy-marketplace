-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingRef" TEXT NOT NULL,
    "userId" TEXT,
    "pharmacyId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL DEFAULT 'in_person',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "deliveryMethod" TEXT NOT NULL DEFAULT 'pickup',
    "deliveryAddress" TEXT,
    "deliveryNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Order_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAtBooking" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_bookingRef_key" ON "Order"("bookingRef");

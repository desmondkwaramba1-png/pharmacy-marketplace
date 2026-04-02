const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDummyStock() {
  console.log('Fetching medicines and pharmacies...');
  const medicines = await prisma.medicine.findMany({ take: 5 });
  let pharmacy = await prisma.pharmacy.findFirst();

  if (!pharmacy) {
    console.log('Creating dummy pharmacy...');
    pharmacy = await prisma.pharmacy.create({
      data: {
        name: 'MediFind Demo Pharmacy',
        address: '123 Main St',
        suburb: 'Avondale',
        city: 'Harare',
        latitude: -17.8252,
        longitude: 31.0335,
        isActive: true,
      }
    });
  }

  for (const med of medicines) {
    console.log(`Adding stock for ${med.genericName}...`);
    await prisma.pharmacyInventory.upsert({
      where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId: med.id } },
      update: { stockStatus: 'in_stock', quantity: 50, price: med.standardPrice || 5.0 },
      create: { pharmacyId: pharmacy.id, medicineId: med.id, stockStatus: 'in_stock', quantity: 50, price: med.standardPrice || 5.0 },
    });
  }
  console.log('Successfully added stock to DB!');
}

addDummyStock()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

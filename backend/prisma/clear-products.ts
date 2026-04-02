import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database cleanup...');

  // Delete all PharmacyInventory
  const inventoryDeleted = await prisma.pharmacyInventory.deleteMany();
  console.log(`  ✅ Deleted ${inventoryDeleted.count} inventory records.`);

  // Delete all Medicines
  const medicinesDeleted = await prisma.medicine.deleteMany();
  console.log(`  ✅ Deleted ${medicinesDeleted.count} medicines.`);

  console.log('\n✅ Database cleanup completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

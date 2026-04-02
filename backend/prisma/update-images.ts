import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImagesToLocal() {
  console.log('🔄 Replacing external image URLs with local image placeholder...');
  
  const updatedCount = await prisma.medicine.updateMany({
    data: {
      imageUrl: '/images/tablet.svg',
    },
  });

  console.log(`✅ Updated ${updatedCount.count} medicines to use local images.`);
}

updateImagesToLocal()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

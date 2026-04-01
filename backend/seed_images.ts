import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultImages: Record<string, string> = {
  'Paracetamol': 'https://images.unsplash.com/photo-1584308666744-24d5e47895f8?w=400&h=400&fit=crop',
  'Ibuprofen': 'https://images.unsplash.com/photo-1550572017-edb7348eab70?w=400&h=400&fit=crop',
  'Amoxicillin': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=400&fit=crop',
  'Cetirizine': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop',
  'Omeprazole': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop',
  'Loratadine': 'https://plus.unsplash.com/premium_photo-1675719602061-4c177af8b04a?w=400&h=400&fit=crop',
  'Metformin': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop',
};

const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5e47895f8?w=400&h=400&fit=crop';

async function main() {
  const medicines = await prisma.medicine.findMany();
  for (const med of medicines) {
    const img = defaultImages[med.genericName] || fallbackImage;
    await prisma.medicine.update({
      where: { id: med.id },
      data: { imageUrl: img },
    });
  }
  console.log('Seeded images for ' + medicines.length + ' medicines');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

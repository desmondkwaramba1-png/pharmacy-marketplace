import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const pharmacies = [
  {
    name: 'Health Plus Pharmacy',
    address: '12 Enterprise Road, Avondale',
    suburb: 'Avondale',
    city: 'Harare',
    latitude: -17.7900,
    longitude: 31.0440,
    phone: '+263 4 336 700',
    email: 'info@healthplus.co.zw',
    operatingHours: JSON.stringify({
      mon: '08:00-20:00', tue: '08:00-20:00', wed: '08:00-20:00',
      thu: '08:00-20:00', fri: '08:00-20:00', sat: '09:00-17:00', sun: 'Closed',
    }),
  },
  {
    name: 'City Center Pharmacy',
    address: '7 Jason Moyo Avenue, CBD',
    suburb: 'CBD',
    city: 'Harare',
    latitude: -17.8292,
    longitude: 31.0522,
    phone: '+263 4 702 111',
    email: 'citycenter@pharmacy.co.zw',
    operatingHours: JSON.stringify({
      mon: '08:00-18:00', tue: '08:00-18:00', wed: '08:00-18:00',
      thu: '08:00-18:00', fri: '08:00-18:00', sat: '09:00-13:00', sun: 'Closed',
    }),
  },
  {
    name: 'Westgate Pharmacy',
    address: 'Shop 14, Westgate Shopping Centre',
    suburb: 'Westgate',
    city: 'Harare',
    latitude: -17.8000,
    longitude: 31.0050,
    phone: '+263 4 661 200',
    email: 'westgate@pharmacy.co.zw',
    operatingHours: JSON.stringify({
      mon: '08:00-21:00', tue: '08:00-21:00', wed: '08:00-21:00',
      thu: '08:00-21:00', fri: '08:00-21:00', sat: '09:00-18:00', sun: '10:00-16:00',
    }),
  },
  {
    name: 'Borrowdale Pharmacy',
    address: '45 Borrowdale Road, Borrowdale',
    suburb: 'Borrowdale',
    city: 'Harare',
    latitude: -17.7500,
    longitude: 31.0900,
    phone: '+263 4 882 100',
    email: 'borrowdale@pharmacy.co.zw',
    operatingHours: JSON.stringify({
      mon: '08:00-19:00', tue: '08:00-19:00', wed: '08:00-19:00',
      thu: '08:00-19:00', fri: '08:00-19:00', sat: '09:00-15:00', sun: 'Closed',
    }),
  },
  {
    name: 'Belgravia Health Pharmacy',
    address: '3 Selous Avenue, Belgravia',
    suburb: 'Belgravia',
    city: 'Harare',
    latitude: -17.8100,
    longitude: 31.0430,
    phone: '+263 4 253 677',
    email: 'belgravia@pharmacy.co.zw',
    operatingHours: JSON.stringify({
      mon: '07:30-20:00', tue: '07:30-20:00', wed: '07:30-20:00',
      thu: '07:30-20:00', fri: '07:30-20:00', sat: '08:00-16:00', sun: '09:00-13:00',
    }),
  },
];

const medicines = [
  { genericName: 'Paracetamol', brandName: 'Panadol', dosage: '500mg', form: 'tablet', category: 'Painkiller', description: 'Used for mild to moderate pain and fever reduction. Common for headaches, muscle aches.', standardPrice: 2.50 },
  { genericName: 'Ibuprofen', brandName: 'Brufen', dosage: '400mg', form: 'tablet', category: 'Anti-inflammatory', description: 'NSAID for pain, fever and inflammation relief.', standardPrice: 3.20 },
  { genericName: 'Amoxicillin', brandName: 'Amoxil', dosage: '250mg', form: 'capsule', category: 'Antibiotic', description: 'Broad-spectrum antibiotic for bacterial infections.', standardPrice: 8.50 },
  { genericName: 'Metformin', brandName: 'Glucophage', dosage: '500mg', form: 'tablet', category: 'Antidiabetic', description: 'First-line medication for type 2 diabetes.', standardPrice: 5.00 },
  { genericName: 'Amlodipine', brandName: 'Norvasc', dosage: '5mg', form: 'tablet', category: 'Antihypertensive', description: 'Calcium channel blocker for high blood pressure.', standardPrice: 7.80 },
  { genericName: 'Aspirin', brandName: 'Disprin', dosage: '75mg', form: 'tablet', category: 'Antiplatelet', description: 'Blood thinner for heart protection and pain relief.', standardPrice: 2.00 },
  { genericName: 'Omeprazole', brandName: 'Losec', dosage: '20mg', form: 'capsule', category: 'Antacid', description: 'Proton pump inhibitor for acid reflux and ulcers.', standardPrice: 9.00 },
  { genericName: 'Ciprofloxacin', brandName: 'Ciprobay', dosage: '500mg', form: 'tablet', category: 'Antibiotic', description: 'Fluoroquinolone antibiotic for urinary tract and respiratory infections.', standardPrice: 12.00 },
  { genericName: 'Insulin (Human)', brandName: 'Humulin R', dosage: '100 IU/ml', form: 'injection', category: 'Antidiabetic', description: 'Short-acting insulin for diabetes management.', standardPrice: 28.00 },
  { genericName: 'Atenolol', brandName: 'Tenormin', dosage: '50mg', form: 'tablet', category: 'Beta-blocker', description: 'Beta-blocker for hypertension and angina.', standardPrice: 6.50 },
  { genericName: 'Salbutamol', brandName: 'Ventolin', dosage: '100mcg', form: 'inhaler', category: 'Bronchodilator', description: 'Reliever inhaler for asthma and COPD.', standardPrice: 15.00 },
  { genericName: 'Doxycycline', brandName: 'Vibramycin', dosage: '100mg', form: 'capsule', category: 'Antibiotic', description: 'Tetracycline antibiotic for malaria prophylaxis and infections.', standardPrice: 10.00 },
  { genericName: 'Chloroquine', brandName: 'Nivaquine', dosage: '250mg', form: 'tablet', category: 'Antimalarial', description: 'Treatment and prophylaxis for malaria.', standardPrice: 4.50 },
  { genericName: 'Oral Rehydration Salts', brandName: 'Dioralyte', dosage: '20g/sachet', form: 'powder', category: 'Rehydration', description: 'Treatment for dehydration from diarrhea and vomiting.', standardPrice: 1.20 },
  { genericName: 'Zinc Sulfate', brandName: 'Zincovit', dosage: '20mg', form: 'tablet', category: 'Supplement', description: 'Mineral supplement to support immune system.', standardPrice: 3.50 },
  { genericName: 'Multivitamins', brandName: 'Centrum', dosage: 'Standard', form: 'tablet', category: 'Supplement', description: 'Complete daily multivitamin for general wellness.', standardPrice: 12.00 },
  { genericName: 'Metronidazole', brandName: 'Flagyl', dosage: '400mg', form: 'tablet', category: 'Antibiotic', description: 'Antibiotic for bacterial and protozoal infections.', standardPrice: 5.50 },
  { genericName: 'Enalapril', brandName: 'Vasotec', dosage: '10mg', form: 'tablet', category: 'ACE Inhibitor', description: 'ACE inhibitor for heart failure and hypertension.', standardPrice: 8.00 },
  { genericName: 'Prednisolone', brandName: 'Prednisolone', dosage: '5mg', form: 'tablet', category: 'Corticosteroid', description: 'Corticosteroid for inflammatory and autoimmune conditions.', standardPrice: 6.00 },
  { genericName: 'Co-trimoxazole', brandName: 'Bactrim', dosage: '480mg', form: 'tablet', category: 'Antibiotic', description: 'Sulfonamide antibiotic for UTIs and respiratory infections.', standardPrice: 4.00 },
];

const stockStatuses: Array<'in_stock' | 'low_stock' | 'out_of_stock'> = ['in_stock', 'in_stock', 'in_stock', 'low_stock', 'out_of_stock'];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin users for each pharmacy
  const adminUsers = [];
  for (let i = 1; i <= 5; i++) {
    const passwordHash = await bcrypt.hash('Password123', 12);
    const user = await prisma.user.upsert({
      where: { email: `admin@pharmacy${i}.com` },
      update: {},
      create: {
        email: `admin@pharmacy${i}.com`,
        passwordHash,
        firstName: ['John', 'Sarah', 'Michael', 'Grace', 'David'][i - 1],
        lastName: ['Doe', 'Smith', 'Johnson', 'Moyo', 'Ncube'][i - 1],
        role: 'pharmacist',
        isVerified: true,
      },
    });
    adminUsers.push(user);
    console.log(`  ✅ Created user: ${user.email}`);
  }

  // Create pharmacies
  const createdPharmacies = [];
  for (let i = 0; i < pharmacies.length; i++) {
    const pharmacy = await prisma.pharmacy.upsert({
      where: { ownerId: adminUsers[i].id },
      update: {},
      create: { ...pharmacies[i], ownerId: adminUsers[i].id },
    });
    createdPharmacies.push(pharmacy);
    console.log(`  ✅ Created pharmacy: ${pharmacy.name}`);
  }

  // Create medicines
  const createdMedicines = [];
  for (const med of medicines) {
    const medicine = await prisma.medicine.upsert({
      where: { id: med.genericName.replace(/\s+/g, '_').toLowerCase() } as any,
      update: {},
      create: med,
    });
    createdMedicines.push(medicine);
  }

  // Fallback - fetch all medicines
  const allMedicines = await prisma.medicine.findMany();
  console.log(`  ✅ Created ${allMedicines.length} medicines`);

  // Create inventory for each pharmacy
  for (const pharmacy of createdPharmacies) {
    for (let i = 0; i < allMedicines.length; i++) {
      const medicine = allMedicines[i];
      const stockStatus = stockStatuses[i % stockStatuses.length];
      const quantity = stockStatus === 'out_of_stock' ? 0 : stockStatus === 'low_stock' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 100) + 10;
      const price = medicine.standardPrice ? medicine.standardPrice * (0.9 + Math.random() * 0.3) : null;

      await prisma.pharmacyInventory.upsert({
        where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId: medicine.id } },
        update: {},
        create: {
          pharmacyId: pharmacy.id,
          medicineId: medicine.id,
          stockStatus,
          quantity,
          price: price ? Math.round(price * 100) / 100 : null,
        },
      });
    }
    console.log(`  ✅ Seeded inventory for ${pharmacy.name}`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📧 Demo accounts:');
  for (let i = 1; i <= 5; i++) {
    console.log(`   admin@pharmacy${i}.com  /  Password123`);
  }
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

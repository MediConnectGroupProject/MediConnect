import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = ['Antibiotics', 'Analgesics', 'Cardiovascular', 'Supplements', 'Cough & Cold', 'Cosmetics', 'Medical Devices', 'Baby Care', 'Personal Care', 'First Aid', 'Surgical Supplies'];
  for (const cat of categories) {
    await prisma.medicineCategory.upsert({
        where: { name: cat },
        update: {},
        create: { name: cat }
    });
  }
  console.log('Categories seeded directly.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

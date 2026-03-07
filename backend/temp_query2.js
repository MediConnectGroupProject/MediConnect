import prisma from './config/connection.js';
import fs from 'fs';

async function query() {
   const meds = await prisma.medicine.findMany({ 
       where: { name: { contains: 'Amoxicillin' } }, 
       include: { medicineCategory: true } 
   });
   fs.writeFileSync('temp_meds_utf8.json', JSON.stringify(meds, null, 2), 'utf8');
}

query()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

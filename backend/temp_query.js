import prisma from './config/connection.js';

async function query() {
   const meds = await prisma.medicine.findMany({ 
       where: { name: { contains: 'Amoxicillin' } }, 
       include: { medicineCategory: true } 
   });
   console.log("FOUND MEDS:");
   console.log(JSON.stringify(meds, null, 2));
}

query()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

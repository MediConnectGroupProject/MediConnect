import prisma from './config/connection.js';

async function cleanup() {
   const dupes = await prisma.medicine.findMany({ 
       where: { name: 'Amoxicillin' } 
   });
   
   console.log(`Found ${dupes.length} duplicates to delete.`);
   
   const ids = dupes.map(d => d.medicineId);

   if (ids.length > 0) {
       await prisma.$transaction(async (tx) => {
           await tx.stockAdjustment.deleteMany({ where: { medicineId: { in: ids } } });
           await tx.unitConversion.deleteMany({ where: { medicineId: { in: ids } } });
           await tx.inventoryLogs.deleteMany({ where: { medicineId: { in: ids } } });
           await tx.billItem.deleteMany({ where: { medicineId: { in: ids } } });
           await tx.prescriptionItem.deleteMany({ where: { medicineId: { in: ids } } });
           await tx.batch.deleteMany({ where: { medicineId: { in: ids } } });
           
           await tx.medicine.deleteMany({ where: { medicineId: { in: ids } } });
       });
   }
   
   console.log("Cleanup complete.");
}

cleanup()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

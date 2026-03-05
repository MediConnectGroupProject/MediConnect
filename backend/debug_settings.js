
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    console.log("Current System Settings in DB:");
    console.log(JSON.stringify(settings, null, 2));
    
    // Check if fields exist
    if (settings) {
        if ('hospitalAddress' in settings) {
            console.log("✅ hospitalAddress field exists.");
        } else {
            console.log("❌ hospitalAddress field MISSING in DB result.");
        }
    }
  } catch (e) {
    console.error("Error connecting to DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

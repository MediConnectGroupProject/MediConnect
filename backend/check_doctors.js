import { PrismaClient } from '@prisma/client';
import prisma from './config/connection.js';

async function fixWorkingHours() {
  try {
    // Find all doctors with workingHours
    const doctors = await prisma.doctor.findMany({
      select: {
        doctorId: true,
        workingHours: true,
        user: { select: { firstName: true, lastName: true } }
      }
    });

    console.log('Fixing working hours for doctors...');

    for (const doctor of doctors) {
      if (doctor.workingHours) {
        const updatedHours = { ...doctor.workingHours };
        let needsUpdate = false;

        // Fix empty start/end times
        Object.keys(updatedHours).forEach(day => {
          const dayConfig = updatedHours[day];
          if (dayConfig) {
            if (!dayConfig.start || dayConfig.start.trim() === '') {
              dayConfig.start = '09:00';
              needsUpdate = true;
            }
            if (!dayConfig.end || dayConfig.end.trim() === '') {
              dayConfig.end = '17:00';
              needsUpdate = true;
            }
          }
        });

        if (needsUpdate) {
          await prisma.doctor.update({
            where: { doctorId: doctor.doctorId },
            data: { workingHours: updatedHours }
          });
          console.log(`Fixed working hours for Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
        }
      }
    }

    console.log('Working hours fix completed.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

fixWorkingHours();
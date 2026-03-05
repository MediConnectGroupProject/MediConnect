import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC MATCH START ---');
    
    // 1. Get Doctor User
    const doctor = await prisma.user.findUnique({
        where: { email: 'doctor@example.com' },
    });
    
    if (!doctor) {
        console.log('Error: Doctor user not found in DB.');
        return;
    }
    console.log(`Doctor Email: ${doctor.email}`);
    console.log(`Doctor ID (DB): ${doctor.id}`);

    // 2. Controller Logic Simulation
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    console.log(`Server Time: ${new Date().toISOString()}`);
    console.log(`Start of Day: ${startOfDay.toISOString()}`);
    console.log(`End of Day:   ${endOfDay.toISOString()}`);

    // 3. Check Appointments
    const totalAppts = await prisma.appointment.count({
        where: { doctorId: doctor.id }
    });
    console.log(`Total Appointments in DB for this ID: ${totalAppts}`);

    const todaysAppts = await prisma.appointment.findMany({
        where: {
            doctorId: doctor.id,
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    console.log(`Appointments found in Today's Range: ${todaysAppts.length}`);
    todaysAppts.forEach(a => {
        console.log(` - [${a.status}] ${a.time.toISOString()} (Date: ${a.date.toISOString()})`);
    });

    if (todaysAppts.length === 0 && totalAppts > 0) {
        console.log('WARNING: Appointments exist but outside today query range.');
        const sample = await prisma.appointment.findFirst({ where: { doctorId: doctor.id } });
        console.log(`Sample Appt Date: ${sample.date.toISOString()}`);
    }

    console.log('--- DIAGNOSTIC MATCH END ---');
}

main().finally(async () => await prisma.$disconnect());

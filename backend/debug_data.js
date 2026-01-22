import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC START ---');
    try {
        const doctor = await prisma.user.findUnique({
            where: { email: 'doctor@example.com' },
        });
        
        if (!doctor) {
            console.log('CRITICAL: Doctor user not found!');
            return;
        }
        console.log(`Doctor ID: ${doctor.id}`);

        const allAppointments = await prisma.appointment.findMany({
            where: { doctorId: doctor.id },
            orderBy: { date: 'desc' }
        });

        console.log(`Total Appointments for Doctor: ${allAppointments.length}`);
        
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        console.log(`Query Range (Server Local): ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

        allAppointments.forEach(app => {
            console.log(`Appt [${app.status}] Date: ${app.date.toISOString()} Time: ${app.time.toISOString()} MatchToday: ${app.date >= startOfDay && app.date <= endOfDay}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        console.log('--- DIAGNOSTIC END ---');
    }
}

main();

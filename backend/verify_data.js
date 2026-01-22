import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const doctor = await prisma.user.findUnique({
        where: { email: 'doctor@example.com' },
        include: { doctor: true }
    });
    console.log('Doctor:', doctor ? 'Found' : 'Missing');

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await prisma.appointment.findMany({
        where: {
            doctorId: doctor.id,
            date: { gte: startOfDay, lte: endOfDay }
        }
    });
    console.log('Today Appointments:', appointments.length);
    console.log('Statuses:', appointments.map(a => a.status));

    const reports = await prisma.labReport.count();
    console.log('Lab Reports:', reports);
    
    await prisma.$disconnect();
}
main();

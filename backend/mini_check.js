import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- CHECK ---');
    const doctor = await prisma.user.findUnique({ where: { email: 'doctor@example.com' } });
    if (!doctor) { console.log('No Doctor'); return; }
    console.log('DocID:', doctor.id);
    const count = await prisma.appointment.count({ where: { doctorId: doctor.id } });
    console.log('Total:', count);
    const all = await prisma.appointment.findMany({ 
        where: { doctorId: doctor.id },
        select: { date: true, time: true, status: true } 
    });
    console.log(JSON.stringify(all, null, 2));
}
main().finally(()=>prisma.$disconnect());

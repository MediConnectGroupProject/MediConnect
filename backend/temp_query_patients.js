import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const patients = await prisma.user.findMany({
        where: {
            roles: {
                some: {
                    role: {
                        name: 'PATIENT'
                    }
                }
            }
        },
        take: 3,
        select: {
            email: true
        }
    });
    console.log(JSON.stringify(patients));
}

main().catch(console.error).finally(() => prisma.$disconnect());

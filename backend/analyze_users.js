import prisma from './config/connection.js';
import fs from 'fs';

async function main() {
    try {
        const report = {};

        report.totalUsers = await prisma.user.count();

        // Count "guest" users
        report.guestUsersCount = await prisma.user.count({
            where: {
                email: {
                    contains: 'guest_',
                    endsWith: '@mediconnect.local'
                }
            }
        });

        // Group by email domain
        const users = await prisma.user.findMany({
            select: { email: true }
        });

        const domains = {};
        users.forEach(u => {
            const domain = u.email.split('@')[1];
            domains[domain] = (domains[domain] || 0) + 1;
        });
        report.domains = domains;

        // Sample guest users
        if (report.guestUsersCount > 0) {
            report.sampleGuestUsers = await prisma.user.findMany({
                where: {
                    email: {
                        contains: 'guest_',
                        endsWith: '@mediconnect.local'
                    }
                },
                take: 10,
                select: { id: true, email: true, createdAt: true }
            });
        }
        
        fs.writeFileSync('user_analysis.json', JSON.stringify(report, null, 2));
        console.log("Analysis written to user_analysis.json");
        
    } catch (error) {
        console.error("Error analyzing users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Date range for 7-day trend (Use 7 full days ago from midnight)
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7); 
        sevenDaysAgo.setHours(0,0,0,0);

        console.log(`Debug Info:`);
        console.log(`Today (Local): ${today.toString()}`);
        console.log(`7 Days Ago: ${sevenDaysAgo.toString()}`);

        const weeksBills = await prisma.bill.findMany({
            where: {
                type: 'PHARMACY',
                status: 'PAID',
                paidDate: { gte: sevenDaysAgo }
            },
            orderBy: { paidDate: 'asc' },
            select: { amount: true, paidDate: true, invoiceNumber: true }
        });

        console.log(`\nFound ${weeksBills.length} bills in range.`);
        weeksBills.forEach(b => {
             console.log(` - ${b.invoiceNumber}: ${b.amount} on ${b.paidDate}`);
        });

        // Test the bucketing logic
        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0,0,0,0);
            
            const nextD = new Date(d);
            nextD.setDate(d.getDate() + 1);

            const dailyTotal = weeksBills
                .filter(b => {
                    const bDate = new Date(b.paidDate);
                    return bDate >= d && bDate < nextD;
                })
                .reduce((sum, b) => sum + Number(b.amount), 0);
            
            salesTrend.push({
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                amount: dailyTotal
            });
        }
        console.log('\nCalculated Trend:', salesTrend);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debugStats();

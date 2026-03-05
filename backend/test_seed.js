import { PrismaClient } from '@prisma/client';
console.log('Prisma imported');
import { faker } from '@faker-js/faker';
console.log('Faker imported');
import bcrypt from 'bcryptjs';
console.log('Bcrypt imported');

const prisma = new PrismaClient();
console.log('Prisma client instantiated');

async function main() {
    console.log('Main started');
    await prisma.$disconnect();
}

main();

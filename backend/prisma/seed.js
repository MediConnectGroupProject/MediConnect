import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {

  await prisma.user.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+94#########'),
      password: faker.internet.password(),
    })),
  });

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

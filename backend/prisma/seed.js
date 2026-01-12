import pkg from '@prisma/client';
const {
  PrismaClient
} = pkg;
import {
  faker
} from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {

  // Seed Roles
  await prisma.role.createMany({
    data: [{
        name: 'PATIENT'
      },
      {
        name: 'DOCTOR'
      },
      {
        name: 'ADMIN'
      },
      {
        name: 'PHARMACIST'
      },
      {
        name: 'RECEPTIONIST'
      },
      {
        name: 'MLT'
      }
    ],
    skipDuplicates: true
  });


  // Seed Users
  await prisma.user.createMany({
    data: Array.from({
      length: 10
    }).map(() => ({

      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+94#########'),
      password: faker.internet.password(),
    })),
  });

  // assign roles to users
  const patientRole = await prisma.role.findUnique({
    where: {
      name: 'PATIENT'
    },
  });
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    if (patientRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: patientRole.id,
        },
      });
    }
  }

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
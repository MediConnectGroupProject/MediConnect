import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive seed...');

  // 1. Seed Roles
  const roles = ['PATIENT', 'DOCTOR', 'ADMIN', 'PHARMACIST', 'RECEPTIONIST', 'MLT'];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
  console.log('Roles seeded.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Doctor Setup
  const doctorEmail = 'doctor@example.com';
  const doctorUser = await prisma.user.upsert({
    where: { email: doctorEmail },
    update: { password: hashedPassword, isEmailVerified: true, status: 'ACTIVE' },
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: doctorEmail,
      phone: '+94770000001',
      password: hashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      roles: { create: { role: { connect: { name: 'DOCTOR' } } } }
    }
  });

  // Re-connect role if needed (simpler approach than nested create which can fail if exists)
  // Check if doctor role exists
  const doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } });
  const userRoleStart = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: doctorUser.id, roleId: doctorRole.id } } });
  if (!userRoleStart) {
      await prisma.userRole.create({ data: { userId: doctorUser.id, roleId: doctorRole.id } });
  }

  await prisma.doctor.upsert({
    where: { doctorId: doctorUser.id },
    update: {},
    create: {
      doctorId: doctorUser.id,
      specialization: 'Cardiologist',
      bio: 'Expert in heart health with 10 years of experience.',
      qualifications: 'MBBS, MD',
      availability: true
    }
  });
  console.log(`Doctor ready: ${doctorEmail}`);

  // 2.1 Admin Setup (Default Admin)
  const adminEmail = 'admin@example.com';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, isEmailVerified: true, status: 'ACTIVE' },
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      phone: '+94770000000',
      password: hashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      roles: { create: { role: { connect: { name: 'ADMIN' } } } }
    }
  });
  
  // Ensure Admin role connection if user exists but connection might not (upsert tweak)
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const adminRoleLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } } });
  if (!adminRoleLink) {
      await prisma.userRole.create({ data: { userId: adminUser.id, roleId: adminRole.id } });
  }
  console.log(`Admin ready: ${adminEmail}`);

  // 2.2 Pharmacist Setup
  const pharmacistEmail = 'pharmacist@example.com';
  const pharmacistUser = await prisma.user.upsert({
    where: { email: pharmacistEmail },
    update: { password: hashedPassword, isEmailVerified: true, status: 'ACTIVE' },
    create: {
      firstName: 'Anna',
      lastName: 'Pharma',
      email: pharmacistEmail,
      phone: '+94770000002',
      password: hashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      roles: { create: { role: { connect: { name: 'PHARMACIST' } } } }
    }
  });
  // Ensure role link
  const pharmRole = await prisma.role.findUnique({ where: { name: 'PHARMACIST' } });
  const pharmRoleLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: pharmacistUser.id, roleId: pharmRole.id } } });
  if (!pharmRoleLink) await prisma.userRole.create({ data: { userId: pharmacistUser.id, roleId: pharmRole.id } });
  
  // 2.3 MLT Setup
  const mltEmail = 'mlt@example.com';
  const mltUser = await prisma.user.upsert({
    where: { email: mltEmail },
    update: { password: hashedPassword, isEmailVerified: true, status: 'ACTIVE' },
    create: {
      firstName: 'Mike',
      lastName: 'Lab',
      email: mltEmail,
      phone: '+94770000003',
      password: hashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      roles: { create: { role: { connect: { name: 'MLT' } } } }
    }
  });
  const mltRole = await prisma.role.findUnique({ where: { name: 'MLT' } });
  const mltRoleLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: mltUser.id, roleId: mltRole.id } } });
  if (!mltRoleLink) await prisma.userRole.create({ data: { userId: mltUser.id, roleId: mltRole.id } });

  // 2.4 Receptionist Setup
  const receptEmail = 'receptionist@example.com';
  const receptUser = await prisma.user.upsert({
    where: { email: receptEmail },
    update: { password: hashedPassword, isEmailVerified: true, status: 'ACTIVE' },
    create: {
      firstName: 'Sarah',
      lastName: 'Front',
      email: receptEmail,
      phone: '+94770000004',
      password: hashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      roles: { create: { role: { connect: { name: 'RECEPTIONIST' } } } }
    }
  });
  const receptRole = await prisma.role.findUnique({ where: { name: 'RECEPTIONIST' } });
  const receptRoleLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: receptUser.id, roleId: receptRole.id } } });
  if (!receptRoleLink) await prisma.userRole.create({ data: { userId: receptUser.id, roleId: receptRole.id } });

  console.log('Additional staff roles seeded.');

  // 3. Medicine Categories & Dosage
  const categories = ['Antibiotics', 'Analgesics', 'Cardiovascular', 'Supplements'];
  for (const cat of categories) {
    await prisma.medicineCategory.upsert({
        where: { name: cat },
        update: {},
        create: { name: cat }
    });
  }
  const tabletDosage = await prisma.dosageForms.upsert({
      where: { name: 'Tablet' },
      update: {},
      create: { name: 'Tablet', defaultUnit: 'mg' }
  });

  // 4. Medicines
  const medicinesData = [
    { name: 'Amoxicillin', stock: 500, price: 25.00 },
    { name: 'Paracetamol', stock: 1000, price: 5.00 },
    { name: 'Atorvastatin', stock: 200, price: 45.00 },
    { name: 'Vitamin C', stock: 300, price: 15.00 },
    { name: 'Metformin', stock: 400, price: 10.00 }
  ];

  for (const m of medicinesData) {
      // Find category randomly
      const cat = await prisma.medicineCategory.findFirst({ where: { name: categories[Math.floor(Math.random() * categories.length)] } });
      await prisma.medicine.upsert({ // Using name as unique constraint helper if possible but schema has UUID. findFirst instead.
          where: { medicineId: 'nothing' }, // Hack to always create? No, let's check first
          update: {},
          create: {
              name: m.name,
              stock: m.stock,
              price: m.price,
              categoryId: cat.categoryId,
              dosageId: tabletDosage.dosageId
          }
      }).catch(async () => {
         // Create if not found (upsert requires unique unique field which name might not be?)
         // Schema: name is VARCHAR(200), not unique in schema provided? 
         // Schema: `name String @db.VarChar(200)` no @unique.
         // So we just create.
         await prisma.medicine.create({
             data: {
                name: m.name,
                stock: m.stock,
                price: m.price,
                categoryId: cat.categoryId,
                dosageId: tabletDosage.dosageId
             }
         })
      });
  }
  console.log('Medicines seeded.');

  // 5. Patients (Generate 15 random patients)
  console.log('Seeding Patients...');
  const patients = [];
  for (let i = 0; i < 15; i++) {
      const email = faker.internet.email().toLowerCase(); // Distinct emails
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
              firstName,
              lastName,
              email,
              phone: faker.phone.number().substring(0, 15),
              password: hashedPassword,
              isEmailVerified: true,
              status: 'ACTIVE'
          }
      });
      
      // Assign Role
      const patientRole = await prisma.role.findUnique({ where: { name: 'PATIENT' } });
      try {
        await prisma.userRole.create({ data: { userId: user.id, roleId: patientRole.id } });
      } catch (e) {} // Ignore if exists

      // Patient Profile
      const patient = await prisma.patient.upsert({
          where: { patientId: user.id },
          update: {},
          create: {
              patientId: user.id,
              nic: faker.string.numeric(12),
              dob: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
              address: faker.location.streetAddress(),
              gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
              bloodType: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+']),
              allergies: faker.helpers.maybe(() => 'Peanuts, Penicillin', { probability: 0.3 }),
              conditions: faker.helpers.maybe(() => 'Diabetes, Hypertension', { probability: 0.4 })
          }
      });
      patients.push(patient);
  }

  // 6. Appointments & Dashboard Data
  console.log('Seeding Appointments...');
  const today = new Date();
  
  // Specific Scenarios for Dashboard
  
  // 6.1 "Up Next" - Pending, Fixed to 10:00 AM
  const upNextTime = new Date(today);
  upNextTime.setHours(10, 0, 0, 0); 
  
  await prisma.appointment.create({
      data: {
          patientId: patients[0].patientId, 
          doctorId: doctorUser.id,
          date: upNextTime,
          time: upNextTime,
          status: 'PENDING'
      }
  });

  // 6.2 "In Progress" - Fixed to 11:00 AM
  const inProgressTime = new Date(today);
  inProgressTime.setHours(11, 0, 0, 0);
  await prisma.appointment.create({
      data: {
          patientId: patients[1].patientId,
          doctorId: doctorUser.id,
          date: inProgressTime,
          time: inProgressTime,
          status: 'PENDING' // or CONFIRMED, UI handles logic. If we want "In progress" status in DB:
          // Schema enum: PENDING, CONFIRMED, COMPLETED, CANCELED. 
          // Wait, Schema AppointmentStatus doesn't have IN_PROGRESS. 
          // PENDING = Upcoming? 
          // Let's stick to PENDING/CONFIRMED for upcoming. 
          // DoctorPortal code handles 'in_progress' in local state or mapped from something?
          // Line 60 in Portal: `status: apt.status.toLowerCase()`
          // If I want 'in_progress' to appear in Queue, I might need to adjust logic or use 'CONFIRMED' as 'Checked In'.
          // Valid Schema Statuses: PENDING, CONFIRMED, COMPLETED, CANCELED.
          // I will use CONFIRMED to represent "Ready to be seen/Checked In".
      }
  });

  // 6.3 "Completed" - History/Stats (Patients Seen Today)
  for (let i = 2; i < 5; i++) {
      const pastTime = new Date(today);
      pastTime.setHours(9 + i, 0, 0, 0); // 11:00, 12:00...
      await prisma.appointment.create({
          data: {
              patientId: patients[i].patientId,
              doctorId: doctorUser.id,
              date: pastTime,
              time: pastTime,
              status: 'COMPLETED'
          }
      });
  }

  // 6.4 "Pending" - Further out today (14:30, 15:30...)
  for (let i = 0; i < 3; i++) {
      const futureTime = new Date(today);
      futureTime.setHours(14 + i, 30, 0, 0);
      await prisma.appointment.create({
          data: {
              patientId: patients[i].patientId,
              doctorId: doctorUser.id,
              date: futureTime,
              time: futureTime,
              status: 'PENDING'
          }
      });
  }

  // 7. Lab Reports (For "Reports" Tab and Stats)
  // Pending Reports
  await prisma.labReport.create({
      data: {
          patientId: patients[0].patientId,
          doctorId: doctorUser.id,
          testType: 'Full Blood Count',
          status: 'PENDING',
          priority: 'URGENT',
          orderedDate: new Date()
      }
  });
  await prisma.labReport.create({
      data: {
          patientId: patients[2].patientId,
          doctorId: doctorUser.id,
          testType: 'Lipid Profile',
          status: 'PENDING',
          priority: 'NORMAL',
          orderedDate: new Date()
      }
  });

  // Completed Reports
  await prisma.labReport.create({
      data: {
          patientId: patients[3].patientId,
          doctorId: doctorUser.id,
          testType: 'Fasting Blood Sugar',
          status: 'COMPLETED',
          priority: 'NORMAL',
          orderedDate: new Date(new Date().setDate(today.getDate() - 1)),
          results: 'Normal range. Glucose: 95 mg/dL'
      }
  });

  // 8. Prescriptions (For Stats / Requests)
  // Pending Requests (If "PrescriptionStatus" has PENDING)
  // Schema: PENDING, VERIFIED, READY, DISPENSED, REJECTED.
  await prisma.prescription.create({
      data: {
          userId: patients[6].patientId,
          notes: 'Request renewal for Metformin',
          status: 'PENDING',
          issuedAt: new Date()
          // No items yet if it's a request, or maybe items are proposed
      }
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
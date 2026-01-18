import pkg from '@prisma/client';
const {
  PrismaClient
} = pkg;
import {
  faker
} from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

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

  // Helper to hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Create or Update Doctor User
  const doctorEmail = 'doctor@example.com';
  
  // Upsert User to ensure password and verification match
  const doctorUser = await prisma.user.upsert({
      where: { email: doctorEmail },
      update: {
          password: hashedPassword,
          isEmailVerified: true,
          status: 'ACTIVE'
      },
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: doctorEmail,
        phone: '+94770000001',
        password: hashedPassword,
        isEmailVerified: true,
        status: 'ACTIVE',
        roles: {
            create: {
                role: { connect: { name: 'DOCTOR' } }
            }
        }
      }
  });

  // Ensure Doctor Profile exists
  await prisma.doctor.upsert({
      where: { doctorId: doctorUser.id },
      update: {},
      create: {
            doctorId: doctorUser.id,
            specialization: 'Cardiologist',
            availability: true
      }
  });

  console.log(`Created/Updated Doctor: ${doctorEmail} / password123`);

  // 3. Create or Update Patient User
  const patientEmail = 'patient@example.com';
  
  const patientUser = await prisma.user.upsert({
      where: { email: patientEmail },
      update: {
          password: hashedPassword,
          isEmailVerified: true,
          status: 'ACTIVE'
      },
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: patientEmail,
        phone: '+94770000002',
        password: hashedPassword,
        isEmailVerified: true,
        status: 'ACTIVE',
         roles: {
            create: {
                role: { connect: { name: 'PATIENT' } }
            }
        }
    }
  });

  // Ensure Patient Profile exists
  await prisma.patient.upsert({
    where: { patientId: patientUser.id },
    update: {},
    create: {
        patientId: patientUser.id,
        nic: '900000000V',
        dob: new Date('1990-01-01'),
        address: '123 Main St, Colombo',
        gender: 'FEMALE'
    }
  });
  
  console.log(`Created/Updated Patient: ${patientEmail} / password123`);

  // 4. Create other roles (Admin, Pharmacist, Receptionist, MLT)
  const additionalRoles = [
      { role: 'ADMIN', email: 'admin@example.com', firstName: 'Super', lastName: 'Admin' },
      { role: 'PHARMACIST', email: 'pharmacist@example.com', firstName: 'Medi', lastName: 'Pharm' },
      { role: 'RECEPTIONIST', email: 'receptionist@example.com', firstName: 'Front', lastName: 'Desk' },
      { role: 'MLT', email: 'mlt@example.com', firstName: 'Lab', lastName: 'Tech' }
  ];

  for (const r of additionalRoles) {
      const user = await prisma.user.upsert({
          where: { email: r.email },
          update: {
              password: hashedPassword,
              isEmailVerified: true,
              status: 'ACTIVE'
          },
          create: {
              firstName: r.firstName,
              lastName: r.lastName,
              email: r.email,
              phone: `+9477000000${Math.floor(Math.random() * 9)}`, // Random digit
              password: hashedPassword,
              isEmailVerified: true,
              status: 'ACTIVE',
              roles: {
                  create: {
                      role: { connect: { name: r.role } }
                  }
              }
          }
      });
      console.log(`Created/Updated ${r.role}: ${r.email} / password123`);
  }

  // 5. Create Appointments
  // Ensure we have IDs
  if (doctorUser && patientUser) {
      // Create a few appointments
      const today = new Date();
      // Appointment 1: Today, PENDING
      await prisma.appointment.create({
          data: {
              patientId: patientUser.id,
              doctorId: doctorUser.id,
              date: today,
              time: new Date(today.setHours(10, 30, 0, 0)),
              status: 'PENDING'
          }
      });

      // Appointment 2: Today, PENDING (Up Next?)
      await prisma.appointment.create({
        data: {
            patientId: patientUser.id,
            doctorId: doctorUser.id,
            date: today,
            time: new Date(today.setHours(11, 0, 0, 0)),
            status: 'PENDING'
        }
    });

    console.log('Appointments seeded.');
  }

  // 6. Seed Medicines
  const medicines = [
      { name: 'Amoxicillin 500mg', stock: 100, price: 15.00, categoryId: 1, dosageId: 1 },
      { name: 'Lisinopril 10mg', stock: 50, price: 10.00, categoryId: 2, dosageId: 1 },
      { name: 'Metformin 500mg', stock: 200, price: 5.00, categoryId: 3, dosageId: 1 },
      { name: 'Paracetamol 500mg', stock: 500, price: 2.00, categoryId: 1, dosageId: 1 },
      { name: 'Atorvastatin 20mg', stock: 80, price: 20.00, categoryId: 2, dosageId: 1 },
  ];
  
  // Seed Categories & Dosage simple (if needed) or just skip relations for now if lenient
  // For proper seeding, let's create categories
  const cat = await prisma.medicineCategory.upsert({
      where: { name: 'Antibiotics' },
      update: {},
      create: { name: 'Antibiotics' }
  });

  const dosage = await prisma.dosageForms.upsert({
      where: { name: 'Tablet' },
      update: {},
      create: { name: 'Tablet', defaultUnit: 'mg' }
  });

  for (const med of medicines) {
      await prisma.medicine.create({
          data: {
              name: med.name,
              stock: med.stock,
              price: med.price,
              categoryId: cat.categoryId,
              dosageId: dosage.dosageId
          }
      });
  }
  console.log('Medicines seeded.');

  // 7. Seed More Patients
  const patientsList = [
      { firstName: 'Alice', lastName: 'Wonder', email: 'alice@test.com', phone: '+94771111111', nic: '910000000V' },
      { firstName: 'Bob', lastName: 'Builder', email: 'bob@test.com', phone: '+94772222222', nic: '920000000V' },
      { firstName: 'Charlie', lastName: 'Chaplin', email: 'charlie@test.com', phone: '+94773333333', nic: '930000000V' },
      { firstName: 'David', lastName: 'Beckham', email: 'david@test.com', phone: '+94774444444', nic: '940000000V' },
      { firstName: 'Eve', lastName: 'Polastri', email: 'eve@test.com', phone: '+94775555555', nic: '950000000V' },
  ];

  for (const p of patientsList) {
      const u = await prisma.user.upsert({
          where: { email: p.email },
          update: {},
          create: {
              firstName: p.firstName,
              lastName: p.lastName,
              email: p.email,
              phone: p.phone,
              password: hashedPassword,
              isEmailVerified: true,
              status: 'ACTIVE',
              roles: { create: { role: { connect: { name: 'PATIENT' } } } }
          }
      });
      
      await prisma.patient.upsert({
          where: { patientId: u.id },
          update: {},
          create: {
              patientId: u.id,
              nic: p.nic,
              dob: new Date('1990-01-01'),
              address: 'Unknown Address',
              gender: 'MALE' // Simplified
          }
      });
  }
  console.log('Additional Patients seeded.');

  // 8. Seed Lab Reports & Bills for MLT/Receptionist
  // Use existing patientUser
  if (patientUser) {
      await prisma.labReport.create({
          data: {
              patientId: patientUser.id,
              testType: 'Full Blood Count',
              status: 'PENDING',
              priority: 'NORMAL',
              orderedDate: new Date(),
          }
      });

      await prisma.bill.create({
          data: {
              patientId: patientUser.id,
              invoiceNumber: 'INV-001',
              amount: 1500.00,
              status: 'PENDING',
              type: 'LAB_TEST',
              description: 'Full Blood Count Fee'
          }
      });
      console.log('Lab Reports and Bills seeded.');
  }

  // 9. Seed Prescriptions & Notifications (Linking Medicines to Patients)
  if (patientUser) {
      // 9.1 Prescriptions
      // Prescription 1: PENDING
      await prisma.prescription.create({
          data: {
              userId: patientUser.id,
              appointmentId: null, // Direct prescription or link to existing appt if you fetch it
              status: 'PENDING',
              notes: 'Take with food',
              prescriptionItems: {
                  create: [
                      { medicineName: 'Amoxicillin 500mg', dosage: '500mg', duration: new Date(new Date().setDate(new Date().getDate() + 7)), instructions: 'Twice daily' },
                      { medicineName: 'Paracetamol 500mg', dosage: '500mg', instructions: 'As needed for pain' }
                  ]
              }
          }
      });

      // Prescription 2: READY (for Pharmacist to see)
      await prisma.prescription.create({
          data: {
              userId: patientUser.id,
              status: 'READY',
              notes: 'Patient can pick up',
              prescriptionItems: {
                  create: [
                      { medicineName: 'Lisinopril 10mg', dosage: '10mg', instructions: 'Once daily' }
                  ]
              }
          }
      });
      console.log('Prescriptions seeded.');

      // 9.2 Notifications
      await prisma.notification.createMany({
          data: [
              { userId: patientUser.id, message: 'Your appointment is confirmed for tomorrow.', isRead: false },
              { userId: patientUser.id, message: 'Your prescription #1234 is ready for pickup.', isRead: true },
              { userId: patientUser.id, message: 'Lab results are available.', isRead: false }
          ]
      });
      console.log('Notifications seeded.');
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
      console.error(e);
      process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
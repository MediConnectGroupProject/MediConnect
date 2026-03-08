import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting comprehensive seed...');

    // 1. System Settings
    await prisma.systemSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            hospitalName: 'MediConnect Health',
            supportEmail: 'help@mediconnect.com',
            hospitalAddress: 'Colombo 07, Sri Lanka',
            hospitalPhone: '+94 11 255 5555'
        }
    });
    console.log('System settings initialized.');

    // 2. Seed Roles
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

    // 3. Admin Setup (Default Admin)
    const adminEmail = 'admin@example.com';
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: hashedPassword, status: 'ACTIVE' },
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

    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    const adminRoleLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } } });
    if (!adminRoleLink) {
        await prisma.userRole.create({ data: { userId: adminUser.id, roleId: adminRole.id } });
    }

    // 4. Multi-Doctor Setup
    const doctorsData = [
        { email: 'doctor@example.com', first: 'John', last: 'Doe', spec: 'Cardiologist' },
        { email: 'doctor2@example.com', first: 'Jane', last: 'Smith', spec: 'Pediatrician' }
    ];

    const dbDoctors = [];
    for (const doc of doctorsData) {
        const docUser = await prisma.user.upsert({
            where: { email: doc.email },
            update: { password: hashedPassword, status: 'ACTIVE' },
            create: {
                firstName: doc.first,
                lastName: doc.last,
                email: doc.email,
                phone: faker.phone.number().substring(0, 15),
                password: hashedPassword,
                isEmailVerified: true,
                status: 'ACTIVE'
            }
        });

        const dRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } });
        const dLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: docUser.id, roleId: dRole.id } } });
        if (!dLink) await prisma.userRole.create({ data: { userId: docUser.id, roleId: dRole.id } });

        const doctorProfile = await prisma.doctor.upsert({
            where: { doctorId: docUser.id },
            update: {},
            create: {
                doctorId: docUser.id,
                specialization: doc.spec,
                bio: `Experienced ${doc.spec} dedicated to patient care.`,
                qualifications: 'MBBS, MD',
                experience: Math.floor(Math.random() * 15) + 5,
                availability: true
            }
        });
        dbDoctors.push(doctorProfile);
    }
    const primaryDoctorUser = dbDoctors[0];
    console.log('Doctors seeded.');

    // 5. Pharmacist, MLT, Receptionist Setup
    const staffTypes = [
        { email: 'pharmacist@example.com', first: 'Anna', last: 'Pharma', role: 'PHARMACIST' },
        { email: 'mlt@example.com', first: 'Mike', last: 'Lab', role: 'MLT' },
        { email: 'receptionist@example.com', first: 'Sarah', last: 'Front', role: 'RECEPTIONIST' }
    ];

    for (const staff of staffTypes) {
        const sUser = await prisma.user.upsert({
            where: { email: staff.email },
            update: { password: hashedPassword, status: 'ACTIVE' },
            create: {
                firstName: staff.first,
                lastName: staff.last,
                email: staff.email,
                phone: faker.phone.number().substring(0, 15),
                password: hashedPassword,
                isEmailVerified: true,
                status: 'ACTIVE'
            }
        });

        const sRole = await prisma.role.findUnique({ where: { name: staff.role } });
        const sLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: sUser.id, roleId: sRole.id } } });
        if (!sLink) await prisma.userRole.create({ data: { userId: sUser.id, roleId: sRole.id } });
    }

    // 6. Expanded Dosage Forms & Medicine Categories
    const dosageNames = [
        { name: 'Tablet', defaultUnit: 'mg' },
        { name: 'Capsule', defaultUnit: 'mg' },
        { name: 'Syrup', defaultUnit: 'ml' },
        { name: 'Drops', defaultUnit: 'drops' },
        { name: 'Cream', defaultUnit: 'mg' }
    ];

    for (const d of dosageNames) {
        await prisma.dosageForms.upsert({
            where: { name: d.name },
            update: {},
            create: { name: d.name, defaultUnit: d.defaultUnit }
        });
    }

    const tabletDosage = await prisma.dosageForms.findUnique({ where: { name: 'Tablet' } });
    const syrupDosage = await prisma.dosageForms.findUnique({ where: { name: 'Syrup' } });

    const categories = ['Antibiotics', 'Analgesics', 'Cardiovascular', 'Supplements', 'Cough & Cold', 'Cosmetics', 'Medical Devices', 'Baby Care', 'Personal Care', 'First Aid', 'Surgical Supplies'];
    for (const cat of categories) {
        await prisma.medicineCategory.upsert({
            where: { name: cat },
            update: {},
            create: { name: cat }
        });
    }

    // 7. Suppliers
    const suppliersData = [
        { name: 'PharmaCorp', contactPerson: 'John Sales', email: 'sales@pharmacorp.com', phone: '+94771111111' },
        { name: 'MediSupply Global', contactPerson: 'Jane Dist', email: 'orders@medisupply.com', phone: '+94772222222' }
    ];

    const dbSuppliers = [];
    for (const s of suppliersData) {
        let supplier = await prisma.supplier.findFirst({ where: { name: s.name } });
        if (!supplier) {
            supplier = await prisma.supplier.create({
                data: {
                    ...s,
                    address: faker.location.streetAddress()
                }
            });
        }
        dbSuppliers.push(supplier);
    }

    // 8. Medicines with Unit Conversions Data & Stock Adjustments
    const medicinesData = [
        { name: 'Amoxicillin 500mg', baseStock: 1500, price: 25.00, dosageId: tabletDosage.dosageId, conversions: [{ name: 'Card', multi: 10 }] },
        { name: 'Paracetamol 500mg', baseStock: 3000, price: 5.00, dosageId: tabletDosage.dosageId, conversions: [{ name: 'Card', multi: 10 }, { name: 'Box', multi: 100 }] },
        { name: 'Atorvastatin 20mg', baseStock: 800, price: 45.00, dosageId: tabletDosage.dosageId, conversions: [{ name: 'Card', multi: 15 }] },
        { name: 'Vitamin C 100mg', baseStock: 2500, price: 15.00, dosageId: tabletDosage.dosageId, conversions: [{ name: 'Bottle', multi: 60 }] },
        { name: 'Cough Syrup (Guaifenesin)', baseStock: 50, price: 350.00, dosageId: syrupDosage.dosageId, conversions: [] } // Just base bottles
    ];

    const dbMedicines = [];
    for (const m of medicinesData) {
        const catName = categories[Math.floor(Math.random() * categories.length)];
        const cat = await prisma.medicineCategory.findFirst({ where: { name: catName } });

        let med = await prisma.medicine.findFirst({ where: { name: m.name } });
        if (!med) {
            med = await prisma.medicine.create({
                data: {
                    name: m.name,
                    stock: m.baseStock,
                    price: m.price,
                    categoryId: cat.categoryId,
                    dosageId: m.dosageId
                }
            });
        }
        dbMedicines.push(med);

        // Unit Conversions
        for (const conv of m.conversions) {
            await prisma.unitConversion.create({
                data: {
                    medicineId: med.medicineId,
                    unitName: conv.name,
                    multiplier: conv.multi
                }
            });
        }

        // Normal Batch
        const normalBatch = await prisma.batch.create({
            data: {
                medicineId: med.medicineId,
                batchNumber: `BN-${faker.string.alphanumeric(5).toUpperCase()}`,
                supplierId: dbSuppliers[0].id,
                quantity: m.baseStock,
                originalQuantity: m.baseStock,
                expiryDate: faker.date.future({ years: 2 }),
                unitCost: m.price * 0.7
            }
        });

        // Stock Adjustments
        if (m.name !== 'Cough Syrup (Guaifenesin)') {
            await prisma.stockAdjustment.create({
                data: {
                    medicineId: med.medicineId,
                    batchId: normalBatch.id,
                    quantity: -10, // wastage
                    reason: 'DAMAGED',
                    notes: 'Dropped during transit',
                    userId: adminUser.id // Admin did adjustment
                }
            });
            // Fix master stock count slightly
            await prisma.medicine.update({
                where: { medicineId: med.medicineId },
                data: { stock: { decrement: 10 } }
            });
        }
    }

    // Create explicit Low/Critical Stock and Expiring instances
    // Update Atorvastatin to Critical low stock manually
    await prisma.medicine.update({
        where: { medicineId: dbMedicines[2].medicineId },
        data: { stock: 4 } // Very low stock
    });

    // Adding an Expiring Batch for Paracetamol
    await prisma.batch.create({
        data: {
            medicineId: dbMedicines[1].medicineId,
            batchNumber: `EXP-${faker.string.alphanumeric(5).toUpperCase()}`,
            supplierId: dbSuppliers[1].id,
            quantity: 200,
            originalQuantity: 500,
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days exp
            unitCost: 3.50
        }
    });

    console.log('Pharmacy Inventory Setup complete.');

    // 9. Diverse Patients
    console.log('Seeding Comprehensive Patients...');
    const patientProfiles = [];

    // Create 30 patients to give real volume, including inactive flags
    for (let i = 0; i < 30; i++) {
        const isActive = i < 28; // Last 2 suspended/inactive
        const userStatus = isActive ? 'ACTIVE' : (i === 28 ? 'INACTIVE' : 'SUSPENDED');

        const email = faker.internet.email({ provider: 'mediconnect.local' }).toLowerCase();
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email,
                phone: faker.phone.number().substring(0, 15),
                password: hashedPassword,
                isEmailVerified: isActive,
                status: userStatus
            }
        });

        const pRole = await prisma.role.findUnique({ where: { name: 'PATIENT' } });
        const pLink = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: user.id, roleId: pRole.id } } });
        if (!pLink) await prisma.userRole.create({ data: { userId: user.id, roleId: pRole.id } });

        const patient = await prisma.patient.upsert({
            where: { patientId: user.id },
            update: {},
            create: {
                patientId: user.id,
                nic: faker.string.numeric(12),
                dob: faker.date.birthdate({ min: 5, max: 90, mode: 'age' }),
                address: faker.location.streetAddress(),
                gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
                bloodType: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                allergies: faker.helpers.maybe(() => faker.helpers.arrayElement(['Peanuts', 'Penicillin', 'Dust', 'Latex']), { probability: 0.35 }),
                conditions: faker.helpers.maybe(() => faker.helpers.arrayElement(['Diabetes Type 2', 'Hypertension', 'Asthma', 'Arthritis']), { probability: 0.4 })
            }
        });
        patientProfiles.push(patient);
    }

    // 10. Appointments: Historical, Recent, and Upcoming
    console.log('Generating Appointments & Histories...');
    const today = new Date();
    const now = new Date();
    const dbAppointments = [];

    // Up Next / In Progress (Today right now)
    // Generate 15 appointments for today to allow extensive testing
    for (let i = 0; i < 15; i++) {
        const aptTime = new Date(today);

        // Distribute appointments across the current day (from 9 AM to 5 PM)
        const hourOffset = 9 + Math.floor((i / 15) * 8);
        aptTime.setHours(hourOffset, (i % 2 === 0 ? 0 : 30), 0, 0);

        let status = 'PENDING';
        // Make one of them ready to be triggered
        if (i === 0) status = 'CONFIRMED';

        const newApt = await prisma.appointment.create({
            data: {
                patientId: patientProfiles[i % patientProfiles.length].patientId,
                doctorId: dbDoctors[0].doctorId, // Assign all to the primary testing doctor
                date: now,
                time: now,
                status: status
            }
        });
        dbAppointments.push(newApt);
    }

    // Historical Appointments (Past year to Past Month)
    for (let j = 0; j < 20; j++) {
        const historicalDate = faker.date.past({ years: 1, refDate: today });
        historicalDate.setHours(Math.floor(Math.random() * 8) + 9, 0, 0, 0); // Working hours

        await prisma.appointment.create({
            data: {
                patientId: patientProfiles[j % patientProfiles.length].patientId,
                doctorId: dbDoctors[j % 2].doctorId, // Alternate doctors
                date: historicalDate,
                time: historicalDate,
                status: faker.helpers.arrayElement(['COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELED'])
            }
        });
    }

    // 11. Lab Reports: Historical & Recent Active
    await prisma.labReport.createMany({
        data: [
            { patientId: patientProfiles[0].patientId, doctorId: dbDoctors[0].doctorId, testType: 'Full Blood Count', status: 'PENDING', priority: 'URGENT', orderedDate: new Date() },
            { patientId: patientProfiles[2].patientId, doctorId: dbDoctors[1].doctorId, testType: 'Lipid Profile', status: 'PENDING', priority: 'NORMAL', orderedDate: new Date() },
            // Historical
            { patientId: patientProfiles[0].patientId, doctorId: dbDoctors[0].doctorId, testType: 'Fasting Blood Sugar', status: 'COMPLETED', priority: 'NORMAL', orderedDate: faker.date.recent({ days: 30 }), results: 'Glucose levels slightly elevated. Monitor diet.', completedDate: faker.date.recent({ days: 28 }) },
            { patientId: patientProfiles[1].patientId, doctorId: dbDoctors[0].doctorId, testType: 'Liver Function Test', status: 'COMPLETED', priority: 'NORMAL', orderedDate: faker.date.recent({ days: 60 }), results: 'All enzyme levels within normal limits.', completedDate: faker.date.recent({ days: 58 }) }
        ]
    });

    // 12. Pharmacy Bills (Extremely Recent Sales for POS Popular Items Testing)
    console.log('Generating POS Recent Sales data...');
    // Force sales in the last 2 hours
    for (let s = 0; s < 15; s++) {
        const twoHoursAgo = new Date(today.getTime() - (2 * 60 * 60 * 1000));
        // Random slice within last 2 hours
        const recentDate = new Date(twoHoursAgo.getTime() + Math.random() * (today.getTime() - twoHoursAgo.getTime()));

        // Amoxicillin & Paracetamol will be top sellers
        const medsPool = s % 3 === 0 ? dbMedicines : [dbMedicines[0], dbMedicines[1]];
        const med = medsPool[Math.floor(Math.random() * medsPool.length)];

        const qty = Math.floor(Math.random() * 5) + 2;
        const amount = med.price * qty;

        await prisma.bill.create({
            data: {
                patientId: patientProfiles[Math.floor(Math.random() * patientProfiles.length)].patientId,
                invoiceNumber: `INV-${Date.now()}-${s}`,
                amount: amount,
                status: 'PAID',
                type: 'PHARMACY',
                issuedDate: recentDate,
                paidDate: recentDate,
                appointmentId: dbAppointments[s % dbAppointments.length].appointmentId,
                items: {
                    create: {
                        medicineId: med.medicineId,
                        name: med.name,
                        quantity: qty,
                        unitPrice: med.price,
                        totalPrice: amount
                    }
                }
            }
        });
    }

    // 13. Extensive Prescriptions (Various Statuses)
    // DISPENSED (Historical)
    await prisma.prescription.create({
        data: {
            userId: patientProfiles[0].patientId,
            notes: 'Completed prescription from last month',
            status: 'DISPENSED',
            issuedAt: faker.date.recent({ days: 30 }),
            prescriptionItems: {
                create: [
                    { medicineId: dbMedicines[0].medicineId, dosage: '500mg', instructions: '1-1-1 after meals' }
                ]
            }
        }
    });

    // REJECTED
    await prisma.prescription.create({
        data: {
            userId: patientProfiles[1].patientId,
            notes: 'Invalid dosage specified. Return to doctor.',
            status: 'REJECTED',
            issuedAt: faker.date.recent({ days: 2 }),
            prescriptionItems: {
                create: [
                    { medicineId: dbMedicines[2].medicineId, dosage: '2000mg', instructions: 'Too high' }
                ]
            }
        }
    });

    // PENDING
    await prisma.prescription.create({
        data: {
            userId: patientProfiles[3].patientId,
            notes: 'Walk-in request',
            status: 'PENDING',
            issuedAt: new Date(),
            prescriptionItems: {
                create: [
                    { medicineId: dbMedicines[1].medicineId, dosage: '500mg' },
                    { medicineId: dbMedicines[3].medicineId, dosage: '100mg' }
                ]
            }
        }
    });

    // 14. PENDING Bills for Receptionist Payment Queue
    console.log('Generating Pending Bills for Receptionist...');
    for (let b = 0; b < 5; b++) {
        const isLab = b % 2 === 0;
        await prisma.bill.create({
            data: {
                patientId: patientProfiles[b].patientId,
                invoiceNumber: `INV-PEND-${Date.now()}-${b}`,
                amount: isLab ? 1500.00 : 2500.00, // Rs 1500 for Lab, 2500 for Consult
                status: 'PENDING',
                type: isLab ? 'LAB_TEST' : 'APPOINTMENT',
                description: isLab ? 'Full Blood Count Test' : 'General Doctor Consultation',
                issuedDate: new Date()
            }
        });
    }

    console.log('Comprehensive Seeding execution finished!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
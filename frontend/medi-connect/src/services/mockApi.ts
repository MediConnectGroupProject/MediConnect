import type { Appointment, InventoryItem, LabRequest, PatientRecord, Prescription, User } from "../types";



// --- MOCK DATA ---

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. John Doe', email: 'doctor@mediconnect.com', roles: ['DOCTOR'], primaryRole: 'DOCTOR' },
  { id: 'u2', name: 'Jane Patient', email: 'patient@mediconnect.com', roles: ['PATIENT'], primaryRole: 'PATIENT' },
  { id: 'u3', name: 'Pharma Pro', email: 'pharma@mediconnect.com', roles: ['PHARMACIST'], primaryRole: 'PHARMACIST' },
  { id: 'u4', name: 'Admin User', email: 'admin@mediconnect.com', roles: ['ADMIN'], primaryRole: 'ADMIN' },
  { id: 'u5', name: 'Lab Tech', email: 'mlt@mediconnect.com', roles: ['MLT'], primaryRole: 'MLT' },
];


const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'u2', patientName: 'Jane Patient', doctorId: 'u1', doctorName: 'Dr. John Doe', date: '2024-05-20', time: '10:00 AM', status: 'CONFIRMED', reason: 'Headache' },
  { id: 'a2', patientId: 'u2', patientName: 'Jane Patient', doctorId: 'u1', doctorName: 'Dr. John Doe', date: '2024-05-21', time: '11:00 AM', status: 'PENDING', reason: 'Follow-up' },
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Paracetamol', sku: 'PARA-500', quantity: 1000, unitPrice: 5.00, expiryDate: '2025-12-31', category: 'General' },
  { id: 'i2', name: 'Amoxicillin', sku: 'AMOX-250', quantity: 500, unitPrice: 12.00, expiryDate: '2024-10-15', category: 'Antibiotic' },
];

const MOCK_PRESCRIPTIONS: Prescription[] = []; // Start empty or add samples

// --- SERVICE ---

export const MockApi = {
  // Auth
  login: async (email: string): Promise<User> => {
    // Simple mock login: find user by ID or just return the first matching role
    await new Promise(r => setTimeout(r, 500)); // Simulate delay
    const user = MOCK_USERS.find(u => u.email === email || u.primaryRole.toLowerCase() === email.toLowerCase());
    if (user) return user;
    
    // Fallback for testing: if email contains 'doctor' -> return doctor
    if (email.includes('doctor')) return MOCK_USERS[0];
    if (email.includes('patient')) return MOCK_USERS[1];
    if (email.includes('phar')) return MOCK_USERS[2];
    if (email.includes('admin')) return MOCK_USERS[3];
    if (email.includes('mlt')) return MOCK_USERS[4];

    
    throw new Error('Invalid credentials');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  // Doctor
  getDoctorAppointments: async (doctorId: string): Promise<Appointment[]> => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_APPOINTMENTS.filter(a => a.doctorId === doctorId || doctorId === 'u1'); // Return all for demo if ID matches
  },

  getPatientRecords: async (patientId: string): Promise<PatientRecord[]> => {
    // Return dummy records
    return [
      { id: 'r1', patientId, diagnosis: 'Migraine', treatment: 'Rest and Paracetamol', date: '2024-01-10', doctorId: 'u1' }
    ];
  },

  createPrescription: async (prescription: Omit<Prescription, 'id' | 'status' | 'qrCodeData'>): Promise<Prescription> => {
    const newPrescription: Prescription = {
      ...prescription,
      id: `p${Date.now()}`,
      status: 'ISSUED',
      qrCodeData: JSON.stringify({ 
        pId: prescription.patientId, 
        dId: prescription.doctorId, 
        ts: Date.now(),
        items: prescription.items.map(i => i.medicationId) 
      }) // Simplified QR data
    };
    MOCK_PRESCRIPTIONS.push(newPrescription);
    return newPrescription;
  },

  dispensePrescription: async (id: string): Promise<Prescription> => {
    const rx = MOCK_PRESCRIPTIONS.find(p => p.id === id);
    if (!rx) throw new Error("Prescription not found");
    rx.status = 'DISPENSED';
    return rx;
  },


  // Patient
  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    return MOCK_APPOINTMENTS.filter(a => a.patientId === patientId || patientId === 'u2');
  },

  getPatientPrescriptions: async (patientId: string): Promise<Prescription[]> => {
    return MOCK_PRESCRIPTIONS.filter(p => p.patientId === patientId);
  },

  // MLT
  getLabRequests: async (): Promise<LabRequest[]> => {
    // Return dummy lab requests
    return [
      { id: 'l1', patientId: 'u2', patientName: 'Jane Patient', testType: 'Full Blood Count', status: 'PENDING', date: '2024-05-20' },
      { id: 'l2', patientId: 'u2', patientName: 'Jane Patient', testType: 'Urine Test', status: 'COMPLETED', result: 'Normal', date: '2024-05-18' }
    ];
  },

  updateLabResult: async (id: string, result: string): Promise<void> => {
     // Simulate update
     await new Promise(r => setTimeout(r, 500));
     console.log(`Updated lab info ${id} with ${result}`);
  },

  // Admin
  getAllUsers: async (): Promise<User[]> => {
    return MOCK_USERS;
  },

  getSystemStats: async () => {
    return {
      totalUsers: MOCK_USERS.length,
      activeAppointments: MOCK_APPOINTMENTS.length,
      dailyPrescriptions: MOCK_PRESCRIPTIONS.length
    };
  },


  // Pharmacist
  getInventory: async (): Promise<InventoryItem[]> => {
    return MOCK_INVENTORY;
  },
  
  getPrescriptionById: async (id: string): Promise<Prescription | undefined> => {
     return MOCK_PRESCRIPTIONS.find(p => p.id === id);
  }
};

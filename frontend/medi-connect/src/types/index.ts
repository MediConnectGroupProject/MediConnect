export type Role = 'DOCTOR' | 'PATIENT' | 'PHARMACIST' | 'ADMIN' | 'RECEPTIONIST' | 'MLT';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  primaryRole: Role;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO date string
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
}

export interface PrescriptionItem {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  items: PrescriptionItem[];
  status: 'ISSUED' | 'DISPENSED';
  qrCodeData: string; // The content encoded in the QR
  notes?: string;
}


export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  category: string;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  diagnosis: string;
  treatment: string;
  date: string;
  doctorId: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  status: 'PENDING' | 'COMPLETED';
  result?: string;
  date: string;
}


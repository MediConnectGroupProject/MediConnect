export type Role = 'DOCTOR' | 'PATIENT' | 'PHARMACIST' | 'ADMIN' | 'RECEPTIONIST' | 'MLT';

export interface User {
  id: string;
  name: string; // Keep for backward compatibility if used
  firstName: string;
  lastName: string;
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
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  reason?: string;
}

export interface PrescriptionItem {
  id?: string;
  itemId?: string; // Schema
  medicationId?: string;
  medicineId?: string;
  name?: string; // legacy support
  medicineName?: string; // actual schema
  dosage: string;
  frequency?: string;
  timing?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriptionId: string; // Backend uses prescriptionId usually, or id? Schema says prescriptionId.
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  prescriptionItems: PrescriptionItem[]; // Changed from items
  status: 'ISSUED' | 'DISPENSED' | 'PENDING';
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


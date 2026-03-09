import {
  getDoctorStats,
  getAppointments,
  updateAppointmentStatus,
  createPrescription,
  getPatients,
  getDoctorProfile,
  updateDoctorProfile
} from '../../controllers/doctorController.js';
import prisma from '../../config/connection.js';
import { createNotification } from '../../helpers/notificationHelper.js';

describe('Doctor Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = global.testUtils.mockRequest();
    mockRes = global.testUtils.mockResponse();
    mockNext = global.testUtils.mockNext;
    mockReq.user = { id: 'doctor-1' };
    jest.clearAllMocks();
  });

  describe('getDoctorStats', () => {
    it('should return doctor statistics successfully', async () => {
      prisma.appointment.count.mockResolvedValue(5);
      prisma.appointment.findMany.mockResolvedValue([{ patientId: 'p1' }]);
      prisma.labReport.count.mockResolvedValue(2);

      await getDoctorStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        pendingAppointments: 5,
        patientsSeen: 5,
        pendingLabs: 2,
        totalPatients: 1
      }));
    });
  });

  describe('getAppointments', () => {
    it('should return appointments successfully', async () => {
      const mockAppointments = [{ id: 1, status: 'PENDING' }];
      prisma.appointment.findMany.mockResolvedValue(mockAppointments);

      await getAppointments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status and send notification', async () => {
      const mockAppt = {
        appointmentId: 'a1',
        status: 'CONFIRMED',
        patient: { user: { id: 'u1', firstName: 'John' } },
        doctor: { user: { firstName: 'House', lastName: 'MD' } },
        date: new Date()
      };
      prisma.appointment.update.mockResolvedValue(mockAppt);

      mockReq.params = { appointmentId: 'a1' };
      mockReq.body = { status: 'CONFIRMED' };

      await updateAppointmentStatus(mockReq, mockRes);

      expect(prisma.appointment.update).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createPrescription', () => {
    it('should create prescription and notify patient', async () => {
      const mockPrescription = { prescriptionId: 'pr1', prescriptionItems: [] };
      prisma.prescription.create.mockResolvedValue(mockPrescription);
      prisma.doctor.findUnique.mockResolvedValue({ user: { firstName: 'Dr', lastName: 'Feelgood' } });

      mockReq.body = {
        patientId: 'p1',
        items: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Daily', timing: 'After food' }]
      };

      await createPrescription(mockReq, mockRes);

      expect(prisma.prescription.create).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getPatients', () => {
    it('should return mapped patients successfully', async () => {
      const mockPatients = [
        {
          patientId: 'p1',
          dob: '1990-01-01',
          gender: 'MALE',
          user: { firstName: 'John', lastName: 'Doe', phone: '123' },
          appointments: [{ date: '2023-01-01' }]
        }
      ];
      prisma.patient.findMany.mockResolvedValue(mockPatients);

      await getPatients(mockReq, mockRes);

      expect(prisma.patient.findMany).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe' })
      ]));
    });
  });

  describe('getDoctorProfile', () => {
    it('should return doctor profile successfully', async () => {
      const mockDoctor = {
        doctorId: 'doctor-1',
        specialization: 'General',
        user: { firstName: 'John', lastName: 'Doe', email: 'john@doc.com' }
      };
      prisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      await getDoctorProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe'
      }));
    });
  });

  describe('updateDoctorProfile', () => {
    it('should update doctor profile successfully', async () => {
      prisma.user.update.mockResolvedValue({});
      prisma.doctor.update.mockResolvedValue({ id: 'doc1' });

      mockReq.body = { phone: '123', bio: 'Expert', experience: '10' };

      await updateDoctorProfile(mockReq, mockRes);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.doctor.update).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
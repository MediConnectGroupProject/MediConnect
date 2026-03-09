import {
  getDoctorStats,
  getAppointments,
  getUpNextAppointment,
  updateAppointmentStatus,
  createPrescription,
  getPatientById,
  getPatients,
  getDoctorProfile,
  updateDoctorProfile
} from '../../controllers/doctorController.js';
import prisma from '../../config/connection.js';

describe('Doctor Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = global.testUtils.mockRequest();
    mockRes = global.testUtils.mockResponse();
    mockNext = global.testUtils.mockNext;
    jest.clearAllMocks();
  });

  describe('getDoctorStats', () => {
    it('should return doctor statistics successfully', async () => {
      const mockUser = { id: 1 };
      const mockPendingAppointments = 5;
      const mockPatientsSeen = 10;
      const mockTotalPatients = [{ patientId: 1 }, { patientId: 2 }];

      mockReq.user = mockUser;
      prisma.appointment.count.mockResolvedValueOnce(mockPendingAppointments); // pending
      prisma.appointment.count.mockResolvedValueOnce(mockPatientsSeen); // completed
      prisma.appointment.findMany.mockResolvedValue(mockTotalPatients);

      await getDoctorStats(mockReq, mockRes);

      expect(prisma.appointment.count).toHaveBeenCalledTimes(2);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { doctorId: mockUser.id, status: 'COMPLETED' },
        distinct: ['patientId']
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        pendingAppointments: mockPendingAppointments,
        patientsSeen: mockPatientsSeen,
        totalPatients: mockTotalPatients.length
      });
    });
  });

  describe('getAppointments', () => {
    it('should return doctor appointments successfully', async () => {
      const mockUser = { id: 1 };
      const mockAppointments = [
        {
          id: 1,
          date: new Date(),
          status: 'PENDING',
          patient: { firstName: 'John', lastName: 'Doe' }
        }
      ];

      mockReq.user = mockUser;
      mockReq.query = { status: 'pending', page: '1', limit: '10' };

      prisma.appointment.findMany.mockResolvedValue(mockAppointments);
      prisma.appointment.count.mockResolvedValue(mockAppointments.length);

      await getAppointments(mockReq, mockRes);

      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: {
          doctorId: mockUser.id,
          status: 'PENDING'
        },
        include: expect.any(Object),
        orderBy: { date: 'asc' },
        skip: 0,
        take: 10
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockAppointments,
        meta: {
          total: mockAppointments.length,
          limit: 10,
          page: 1,
          totalPages: 1
        }
      });
    });
  });

  describe('getUpNextAppointment', () => {
    it('should return the next upcoming appointment', async () => {
      const mockUser = { id: 1 };
      const mockAppointment = {
        id: 1,
        date: new Date(Date.now() + 3600000), // 1 hour from now
        status: 'CONFIRMED',
        patient: { firstName: 'John', lastName: 'Doe' }
      };

      mockReq.user = mockUser;
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);

      await getUpNextAppointment(mockReq, mockRes);

      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: {
          doctorId: mockUser.id,
          status: { in: ['CONFIRMED', 'PENDING'] },
          date: { gte: expect.any(Date) }
        },
        include: expect.any(Object),
        orderBy: { date: 'asc' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        appointment: mockAppointment
      });
    });

    it('should return null when no upcoming appointments', async () => {
      const mockUser = { id: 1 };

      mockReq.user = mockUser;
      prisma.appointment.findFirst.mockResolvedValue(null);

      await getUpNextAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        appointment: null
      });
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status successfully', async () => {
      const mockUser = { id: 1 };
      const mockAppointment = {
        id: 1,
        status: 'COMPLETED',
        doctorId: mockUser.id
      };
      const mockUpdatedAppointment = { ...mockAppointment, status: 'COMPLETED' };

      mockReq.user = mockUser;
      mockReq.params = { appointmentId: '1' };
      mockReq.body = { status: 'completed' };

      prisma.appointment.findUnique.mockResolvedValue(mockAppointment);
      prisma.appointment.update.mockResolvedValue(mockUpdatedAppointment);

      await updateAppointmentStatus(mockReq, mockRes);

      expect(prisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'COMPLETED' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Appointment status updated successfully',
        appointment: mockUpdatedAppointment
      });
    });

    it('should return 403 if appointment does not belong to doctor', async () => {
      const mockUser = { id: 1 };
      const mockAppointment = {
        id: 1,
        status: 'PENDING',
        doctorId: 2 // Different doctor
      };

      mockReq.user = mockUser;
      mockReq.params = { appointmentId: '1' };
      mockReq.body = { status: 'completed' };

      prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      await updateAppointmentStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own appointments'
      });
    });
  });

  describe('createPrescription', () => {
    it('should create prescription successfully', async () => {
      const mockUser = { id: 1 };
      const prescriptionData = {
        appointmentId: 1,
        medicines: [
          {
            medicineId: 1,
            dosage: '1 tablet',
            frequency: 'twice daily',
            duration: '7 days',
            instructions: 'Take with food'
          }
        ]
      };

      const mockAppointment = {
        id: 1,
        doctorId: mockUser.id,
        patientId: 2
      };

      const mockPrescription = {
        id: 1,
        appointmentId: 1,
        medicines: prescriptionData.medicines
      };

      mockReq.user = mockUser;
      mockReq.body = prescriptionData;

      prisma.appointment.findUnique.mockResolvedValue(mockAppointment);
      prisma.prescription.create.mockResolvedValue(mockPrescription);

      await createPrescription(mockReq, mockRes);

      expect(prisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: prescriptionData.appointmentId }
      });
      expect(prisma.prescription.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Prescription created successfully',
        prescription: mockPrescription
      });
    });

    it('should return 403 if appointment does not belong to doctor', async () => {
      const mockUser = { id: 1 };
      const prescriptionData = {
        appointmentId: 1,
        medicines: []
      };

      const mockAppointment = {
        id: 1,
        doctorId: 2, // Different doctor
        patientId: 2
      };

      mockReq.user = mockUser;
      mockReq.body = prescriptionData;

      prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      await createPrescription(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only create prescriptions for your own appointments'
      });
    });
  });

  describe('getPatientById', () => {
    it('should return patient information successfully', async () => {
      const mockUser = { id: 1 };
      const mockPatient = {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        medicalHistory: []
      };

      mockReq.user = mockUser;
      mockReq.params = { patientId: '2' };

      prisma.user.findFirst.mockResolvedValue(mockPatient);

      await getPatientById(mockReq, mockRes);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 2,
          roles: {
            some: {
              role: { name: 'PATIENT' }
            }
          }
        },
        include: expect.any(Object)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        patient: mockPatient
      });
    });
  });

  describe('getDoctorProfile', () => {
    it('should return doctor profile successfully', async () => {
      const mockUser = { id: 1 };
      const mockProfile = {
        id: 1,
        userId: 1,
        specialization: 'Cardiology',
        bio: 'Experienced cardiologist'
      };

      mockReq.user = mockUser;

      prisma.doctorProfile.findUnique.mockResolvedValue(mockProfile);

      await getDoctorProfile(mockReq, mockRes);

      expect(prisma.doctorProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: expect.any(Object)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        profile: mockProfile
      });
    });
  });

  describe('updateDoctorProfile', () => {
    it('should update doctor profile successfully', async () => {
      const mockUser = { id: 1 };
      const profileData = {
        specialization: 'Neurology',
        bio: 'Updated bio',
        experience: 10
      };

      const mockUpdatedProfile = {
        id: 1,
        userId: 1,
        ...profileData
      };

      mockReq.user = mockUser;
      mockReq.body = profileData;

      prisma.doctorProfile.upsert.mockResolvedValue(mockUpdatedProfile);

      await updateDoctorProfile(mockReq, mockRes);

      expect(prisma.doctorProfile.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        update: expect.any(Object),
        create: expect.any(Object)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        doctor: mockUpdatedProfile
      });
    });
  });

  // Add more test cases for other functions as needed
  describe('getPatients', () => {
    it('should return patients for the doctor', async () => {
      const mockUser = { id: 1 };
      const mockPatients = [
        { id: 2, firstName: 'John', lastName: 'Doe' }
      ];

      mockReq.user = mockUser;

      prisma.appointment.findMany.mockResolvedValue([
        { patientId: 2, patient: mockPatients[0] }
      ]);

      await getPatients(mockReq, mockRes);

      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { doctorId: mockUser.id },
        select: expect.any(Object),
        distinct: ['patientId']
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        patients: [mockPatients[0]]
      });
    });
  });
});
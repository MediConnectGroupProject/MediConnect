import { jest } from '@jest/globals';
import {
    getMyAppointments,
    getMyPrescriptions,
    getNotifications,
    getBillingHistory,
    getAvailableDoctors,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment
} from '../../controllers/patientController.js';
import prisma from '../../config/connection.js';

describe('Patient Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = global.testUtils.mockRequest();
        mockRes = global.testUtils.mockResponse();
        jest.clearAllMocks();
    });

    describe('getMyAppointments', () => {
        it('should return patient appointments successfully', async () => {
            const mockUser = { id: 'user-1' };
            const mockPatient = { patientId: 'user-1' };
            const mockAppointments = [
                {
                    appointmentId: 'app-1',
                    doctor: { user: { firstName: 'Jane', lastName: 'Smith' } },
                    prescriptions: []
                }
            ];

            mockReq.user = mockUser;
            prisma.patient.findFirst.mockResolvedValue(mockPatient);
            prisma.appointment.findMany.mockResolvedValue(mockAppointments);

            await getMyAppointments(mockReq, mockRes);

            expect(prisma.patient.findFirst).toHaveBeenCalledWith({
                where: { patientId: mockUser.id }
            });
            expect(prisma.appointment.findMany).toHaveBeenCalledWith({
                where: { patientId: mockPatient.patientId },
                include: expect.any(Object),
                orderBy: { date: 'desc' }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
        });

        it('should return 404 if patient profile not found', async () => {
            mockReq.user = { id: 'user-1' };
            prisma.patient.findFirst.mockResolvedValue(null);

            await getMyAppointments(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Patient profile not found' });
        });
    });

    describe('getMyPrescriptions', () => {
        it('should return patient prescriptions successfully', async () => {
            const mockUser = { id: 'user-1' };
            const mockPrescriptions = [{ prescriptionId: 'pre-1' }];

            mockReq.user = mockUser;
            prisma.prescription.findMany.mockResolvedValue(mockPrescriptions);

            await getMyPrescriptions(mockReq, mockRes);

            expect(prisma.prescription.findMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                include: expect.any(Object),
                orderBy: { issuedAt: 'desc' }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockPrescriptions);
        });
    });

    describe('getNotifications', () => {
        it('should return notifications successfully', async () => {
            const mockUser = { id: 'user-1' };
            const mockNotifications = [{ notificationId: 'not-1', message: 'Test' }];

            mockReq.user = mockUser;
            prisma.notification.findMany.mockResolvedValue(mockNotifications);

            await getNotifications(mockReq, mockRes);

            expect(prisma.notification.findMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                orderBy: { created_at: 'desc' }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockNotifications);
        });
    });

    describe('getBillingHistory', () => {
        it('should return billing history successfully', async () => {
            const mockUser = { id: 'user-1' };
            const mockPatient = { patientId: 'user-1' };
            const mockBills = [{ billId: 'bill-1', amount: 100 }];

            mockReq.user = mockUser;
            prisma.patient.findFirst.mockResolvedValue(mockPatient);
            prisma.bill.findMany.mockResolvedValue(mockBills);

            await getBillingHistory(mockReq, mockRes);

            expect(prisma.bill.findMany).toHaveBeenCalledWith({
                where: { patientId: mockPatient.patientId },
                orderBy: { issuedDate: 'desc' }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockBills);
        });
    });

    describe('getAvailableDoctors', () => {
        it('should return available doctors successfully', async () => {
            const mockDoctors = [{ doctorId: 'doc-1', availability: true }];

            prisma.doctor.findMany.mockResolvedValue(mockDoctors);

            await getAvailableDoctors(mockReq, mockRes);

            expect(prisma.doctor.findMany).toHaveBeenCalledWith({
                where: { availability: true },
                include: expect.any(Object),
                orderBy: { doctorId: 'asc' }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockDoctors);
        });
    });

    describe('getAvailableSlots', () => {
        it('should return available slots successfully', async () => {
            const mockDoctor = {
                doctorId: 'doc-1',
                availability: true,
                workingHours: {
                    Mon: { active: true, start: '09:00', end: '10:00' }
                }
            };
            // Date is Monday (March 9, 2026 is Monday)
            mockReq.params = { doctorId: 'doc-1' };
            mockReq.query = { date: '2026-03-09' };

            prisma.doctor.findUnique.mockResolvedValue(mockDoctor);
            prisma.appointment.findMany.mockResolvedValue([]);

            await getAvailableSlots(mockReq, mockRes);

            expect(prisma.doctor.findUnique).toHaveBeenCalledWith({
                where: { doctorId: 'doc-1' },
                select: { workingHours: true, availability: true }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const jsonResponse = mockRes.json.mock.calls[0][0];
            expect(jsonResponse.slots).toHaveLength(2); // 09:00, 09:30
            expect(jsonResponse.slots[0].available).toBe(true);
        });

        it('should return 400 if date is missing', async () => {
            mockReq.params = { doctorId: 'doc-1' };
            mockReq.query = {};

            await getAvailableSlots(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'doctorId and date are required' });
        });
    });

    describe('bookAppointment', () => {
        it('should book appointment successfully', async () => {
            const mockUser = { id: 'user-1' };
            const mockPatient = { patientId: 'user-1' };
            const mockDoctor = { doctorId: 'doc-1' };
            const mockNewAppointment = { appointmentId: 'app-1' };

            mockReq.user = mockUser;
            mockReq.body = { doctorId: 'doc-1', date: '2026-03-10', time: '10:00' };

            prisma.patient.findFirst.mockResolvedValue(mockPatient);
            prisma.doctor.findUnique.mockResolvedValue(mockDoctor);
            prisma.appointment.findMany.mockResolvedValue([]);
            prisma.appointment.create.mockResolvedValue(mockNewAppointment);

            await bookAppointment(mockReq, mockRes);

            expect(prisma.appointment.create).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockNewAppointment);
        });

        it('should return 409 if slot is unavailable', async () => {
            const mockUser = { id: 'user-1' };
            const mockPatient = { patientId: 'user-1' };
            const mockDoctor = { doctorId: 'doc-1' };
            const mockExistingAppointments = [{ time: new Date('2026-03-10T10:00:00') }];

            mockReq.user = mockUser;
            mockReq.body = { doctorId: 'doc-1', date: '2026-03-10', time: '10:00' };

            prisma.patient.findFirst.mockResolvedValue(mockPatient);
            prisma.doctor.findUnique.mockResolvedValue(mockDoctor);
            prisma.appointment.findMany.mockResolvedValue(mockExistingAppointments);

            await bookAppointment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json.mock.calls[0][0].message).toContain('time slot is unavailable');
        });
    });

    describe('cancelAppointment', () => {
        it('should cancel appointment successfully', async () => {
            const mockUser = { id: 'user-1' };
            const mockAppointment = {
                appointmentId: 'app-1',
                patientId: 'user-1',
                status: 'PENDING',
                createdAt: new Date()
            };

            mockReq.user = mockUser;
            mockReq.params = { id: 'app-1' };

            prisma.appointment.findUnique.mockResolvedValue(mockAppointment);
            prisma.appointment.update.mockResolvedValue({ ...mockAppointment, status: 'CANCELED' });

            await cancelAppointment(mockReq, mockRes);

            expect(prisma.appointment.update).toHaveBeenCalledWith({
                where: { appointmentId: 'app-1' },
                data: { status: 'CANCELED' }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should return 403 if cancellation window passed', async () => {
            const mockUser = { id: 'user-1' };
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 2); // 2 days ago

            const mockAppointment = {
                appointmentId: 'app-1',
                patientId: 'user-1',
                status: 'PENDING',
                createdAt: oldDate
            };

            mockReq.user = mockUser;
            mockReq.params = { id: 'app-1' };

            prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

            await cancelAppointment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json.mock.calls[0][0].message).toContain('Cancellation window has passed');
        });
    });
});

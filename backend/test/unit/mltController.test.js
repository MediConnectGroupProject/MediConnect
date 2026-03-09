import { jest } from '@jest/globals';
import {
    getLabReportQueue,
    updateLabReport,
    getCompletedLabReports
} from '../../controllers/mltController.js';
import prisma from '../../config/connection.js';

describe('MLT Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = global.testUtils.mockRequest();
        mockRes = global.testUtils.mockResponse();
        jest.clearAllMocks();
    });

    describe('getLabReportQueue', () => {
        it('should return lab report queue successfully', async () => {
            const mockQueue = [
                {
                    reportId: '1',
                    status: 'PENDING',
                    patient: { user: { firstName: 'John', lastName: 'Doe' } },
                    doctor: { user: { firstName: 'Jane', lastName: 'Smith' } }
                }
            ];

            prisma.labReport.findMany.mockResolvedValue(mockQueue);

            await getLabReportQueue(mockReq, mockRes);

            expect(prisma.labReport.findMany).toHaveBeenCalledWith({
                where: {
                    status: {
                        in: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'READY']
                    }
                },
                include: expect.any(Object),
                orderBy: {
                    orderedDate: 'desc'
                }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockQueue);
        });
    });

    describe('updateLabReport', () => {
        it('should update lab report successfully', async () => {
            const mockUpdatedReport = {
                reportId: '1',
                status: 'COMPLETED',
                results: 'Negative',
                notes: 'Patient is healthy'
            };

            mockReq.params = { reportId: '1' };
            mockReq.body = {
                status: 'COMPLETED',
                results: 'Negative',
                notes: 'Patient is healthy'
            };

            prisma.labReport.update.mockResolvedValue(mockUpdatedReport);

            await updateLabReport(mockReq, mockRes);

            expect(prisma.labReport.update).toHaveBeenCalledWith({
                where: { reportId: '1' },
                data: {
                    status: 'COMPLETED',
                    results: 'Negative',
                    notes: 'Patient is healthy',
                    completedDate: expect.any(Date)
                }
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedReport);
        });
    });

    describe('getCompletedLabReports', () => {
        it('should return completed lab reports successfully', async () => {
            const mockCompletedReports = [
                {
                    reportId: '1',
                    status: 'COMPLETED',
                    patient: { user: { firstName: 'John', lastName: 'Doe' } },
                    doctor: { user: { firstName: 'Jane', lastName: 'Smith' } }
                }
            ];

            prisma.labReport.findMany.mockResolvedValue(mockCompletedReports);

            await getCompletedLabReports(mockReq, mockRes);

            expect(prisma.labReport.findMany).toHaveBeenCalledWith({
                where: {
                    status: {
                        in: ['COMPLETED', 'READY']
                    }
                },
                include: expect.any(Object),
                orderBy: {
                    completedDate: 'desc'
                },
                take: 50
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockCompletedReports);
        });
    });
});

import prisma from '../config/connection.js';

// Get Lab Reports Queue (Pending/In Progress)
export const getLabReportQueue = async (req, res) => {

        const queue = await prisma.labReport.findMany({
            where: {
                status: {
                    in: ['PENDING', 'IN_PROGRESS', 'COMPLETED']
                }
            },
            include: {
                patient: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                orderDate: 'desc'
            }
        });
        res.status(200).json(queue);

}

// Update Lab Report Status
export const updateLabReport = async (req, res) => {

        const { reportId } = req.params;
        const { status, resultData, comments } = req.body;

        const updated = await prisma.labReport.update({
            where: { reportId },
            data: { 
                status,
                resultData,
                comments,
                completedDate: status === 'COMPLETED' ? new Date() : undefined
            }
        });

        res.status(200).json(updated);

}

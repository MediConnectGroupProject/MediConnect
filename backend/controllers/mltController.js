import prisma from '../config/connection.js';

// Get Lab Reports Queue
export const getLabReportQueue = async (req, res) => {

    const queue = await prisma.labReport.findMany({
        where: {
            status: {
                in: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'READY']
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
            orderedDate: 'desc'
        }
    });
    res.status(200).json(queue);

}

// Update Lab Report Status
export const updateLabReport = async (req, res) => {

    const { reportId } = req.params;
    const { status, results, notes } = req.body;

    const updated = await prisma.labReport.update({
        where: { reportId },
        data: {
            status,
            results,
            notes,
            completedDate: status === 'COMPLETED' ? new Date() : undefined
        }
    });

    res.status(200).json(updated);

}

// Get Completed Lab Reports (Recent Results)
export const getCompletedLabReports = async (req, res) => {
    const completedReports = await prisma.labReport.findMany({
        where: {
            status: {
                in: ['COMPLETED', 'READY']
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
            completedDate: 'desc'
        },
        take: 50
    });

    res.status(200).json(completedReports);
}

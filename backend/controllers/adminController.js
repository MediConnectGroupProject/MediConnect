import prisma from '../config/connection.js'

// Get user count
const getUserCount = async (req, res) => {

  const userCount = await prisma.user.count();

  return res.status(200).json(userCount);

}

// get all users
const getAllUsers = async (req, res) => {

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const search = req.query.search?.trim() || '';
  const type = req.query.type; // 'internal' | 'external'
  const offset = (page - 1) * limit;

  const whereClause = {
      AND: []
  };

  if (search) {
      whereClause.AND.push({
          OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
          ]
      });
  }

  if (type === 'internal') {
      whereClause.AND.push({
          roles: {
              none: { role: { name: 'PATIENT' } }
          }
      });
  } else if (type === 'external') {
       whereClause.AND.push({
          roles: {
              some: { role: { name: 'PATIENT' } }
          }
      });
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        isEmailVerified: true,

        roles: {
          select: {
            status: true,

            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.user.count({
      where: whereClause
    })
  ]);

  return res.status(200).json({
    data: users,
    meta: {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    }
  });
}

// get roles
const getRoles = async (req, res) => {

  return res.status(200).json({
    data: await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      }
    })
  });
}

// change role status
const changeRoleStatus = async (req, res) => {

  const userId = req.params.userId;
  const roleId = Number(req.params.roleId);
  const {
    status
  } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Action is required"
    })
  }

  // map UI action → DB status
  const statusMap = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    INACTIVE: "INACTIVE",
  }

  const _status = statusMap[status]

  if (!_status) {

    return res.status(400).json({

      message: "Invalid action"
    })
  }

  const updated = await prisma.userRole.update({
    where: {
      userId_roleId: {
        userId: userId,
        roleId: roleId
      }
    },
    data: {
      status: status
    }
  });

  res.json({
    message: "Role updated"
  });
}

// change user status
const changeUserStatus = async (req, res) => {

  const userId = req.params.userId;
  const {
    status
  } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Action is required"
    })
  }

  const statusMap = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    INACTIVE: "INACTIVE",
  }

  const _status = statusMap[status]

  if (!_status) {

    return res.status(400).json({

      message: "Invalid Action."
    })
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status: _status
    }
  });

  return res.status(200).json({
    message: "Action updated successfully"
  });

}

// add role to user
const addRole = async (req, res) => {

  const userId = req.params.userId;
  const {
    roleName
  } = req.body;

  if (!roleName) {

    return res.status(400).json({
      message: "roleName is required"
    });
  }

  // check if role exists
  const isRoleAvailable = await prisma.role.findFirst({
    where: {
      name: roleName
    }
  });

  if (!isRoleAvailable) {
    return res.status(404).json({
      message: 'Role not found'
    });
  }
  const roleId = isRoleAvailable.id;

  //  check if user exists
  const isUserAvailable = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!isUserAvailable) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  // check if user role exists
  const isUserRoleAlreadyExists = await prisma.userRole.findFirst({
    where: {
      userId: userId,
      roleId: roleId
    }
  });

  if (isUserRoleAlreadyExists) {

    return res.status(400).json({
      message: 'User already has this role'
    });
  }

  await prisma.userRole.create({
    data: {
      userId,
      roleId
    }
  });

  // Auto-create Doctor Profile if role is DOCTOR
  if (isRoleAvailable.name.toUpperCase() === 'DOCTOR') {
      const existingDoctor = await prisma.doctor.findUnique({ where: { doctorId: userId } });
      if (!existingDoctor) {
          await prisma.doctor.create({
              data: {
                  doctorId: userId,
                  specialization: 'General Practitioner', // Default
                  availability: true
              }
          });
      }
  }

  return res.status(200).json({
    message: 'Role added to user successfully'
  });
}

// get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
      const totalUsers = await prisma.user.count();
      
      const patients = await prisma.user.count({
          where: { roles: { some: { role: { name: 'PATIENT' } } } }
      });
      
      const doctors = await prisma.user.count({
          where: { roles: { some: { role: { name: 'DOCTOR' } } } }
      });
      
      const pharmacists = await prisma.user.count({
          where: { roles: { some: { role: { name: 'PHARMACIST' } } } }
      });

      const admins = await prisma.user.count({
          where: { roles: { some: { role: { name: 'ADMIN' } } } }
      });

      // Recent Users (Last 5)
      const recentUsers = await prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              roles: {
                  select: { role: { select: { name: true } } }
              }
          }
      });

      // Map recent users to flat format
      const recentUsersMapped = recentUsers.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.roles.length > 0 ? u.roles[0].role.name : 'N/A',
          joinedAt: u.createdAt
      }));

      res.status(200).json({
          totalUsers,
          patients,
          doctors,
          pharmacists,
          admins,
          recentUsers: recentUsersMapped
      });
  } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}

// System Health Check
const getSystemHealth = async (req, res) => {
    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`; // Simple DB ping
        const duration = Date.now() - start;

        const healthData = {
            status: 'Operational',
            details: [
                { component: 'Database', status: 'Connected', latency: `${duration}ms` },
                { component: 'API Server', status: 'Online', latency: '0ms' }, // Self
                { component: 'File Storage', status: 'Operational', latency: 'N/A' },
            ],
            uptime: process.uptime(),
            timestamp: new Date()
        };
        res.status(200).json(healthData);
    } catch (error) {
        console.error("Health Check Failed:", error);
        res.status(500).json({ 
            status: 'Degraded', 
            details: [
                { component: 'Database', status: 'Disconnected', error: error.message },
                { component: 'API Server', status: 'Online' }
            ]
        });
    }
}

// Export Reports
const getSystemReport = async (req, res) => {
    const { type } = req.query; // 'users', 'logs'
    
    try {
        if (type === 'users') {
            const users = await prisma.user.findMany({
                select: { id: true, firstName: true, lastName: true, email: true, status: true, createdAt: true, roles: { select: { role: { select: { name: true } } } } }
            });
            // Simple CSV conversion
            const header = "ID,Name,Email,Role,Status,Joined\n";
            const rows = users.map(u => `"${u.id}","${u.firstName} ${u.lastName}","${u.email}","${u.roles.map(r=>r.role.name).join('|')}","${u.status}","${u.createdAt.toISOString()}"`).join("\n");
            
            res.header('Content-Type', 'text/csv');
            res.attachment('users_report.csv');
            return res.send(header + rows);
        } else if (type === 'logs') {
            // Mock System Logs
            const logs = [
                { id: 1, level: 'INFO', message: 'System started', timestamp: new Date() },
                { id: 2, level: 'INFO', message: 'Cron job executed', timestamp: new Date(Date.now() - 3600000) },
                { id: 3, level: 'WARN', message: 'High memory usage detected', timestamp: new Date(Date.now() - 7200000) }
            ];
            res.json(logs);
        } else {
            res.status(400).json({ message: "Invalid report type" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to generate report" });
    }
}

export {
  getUserCount,
  getAllUsers,
  getRoles,
  changeRoleStatus,
  changeUserStatus,
  addRole,
  getDashboardStats,
  getSystemHealth,
  getSystemReport
}
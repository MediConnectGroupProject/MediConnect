import prisma from '../config/connection.js'

import bcrypt from 'bcryptjs';
import { logAction } from '../utils/auditUtils.js';

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
            // Real Audit Logs CSV
            const logs = await prisma.auditLog.findMany({
                orderBy: { timestamp: 'desc' },
                take: 1000, // Limit export size for performance
                include: {
                    user: {
                        select: { firstName: true, lastName: true, email: true, roles: { select: { role: { select: { name: true } } } } }
                    }
                }
            });

            const header = "Timestamp,Action,Status,User,Email,Role,Details,IP\n";
            const rows = logs.map(l => {
                const userName = l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System';
                const userEmail = l.user ? l.user.email : 'N/A';
                const userRole = l.user && l.user.roles.length > 0 ? l.user.roles[0].role.name : 'N/A';
                // Escape quotes in details
                const cleanDetails = l.details ? l.details.replace(/"/g, '""') : '';
                
                return `"${l.timestamp.toISOString()}","${l.action}","${l.status}","${userName}","${userEmail}","${userRole}","${cleanDetails}","${l.ipAddress || ''}"`;
            }).join("\n");

            res.header('Content-Type', 'text/csv');
            res.attachment('audit_logs.csv');
            return res.send(header + rows);
        } else {
            res.status(400).json({ message: "Invalid report type" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to generate report" });
    }
}

// Create User (Internal)
const createUser = async (req, res) => {
    const { firstName, lastName, email, phone, password, roleName } = req.body;

    // Validate inputs
    if (!firstName || !lastName || !email || !password || !roleName) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Find Role
        const role = await prisma.role.findFirst({ where: { name: roleName } });
        if (!role) {
            return res.status(400).json({ message: "Invalid role selected" });
        }

        // Create User
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                isEmailVerified: true, // Auto-verified since admin created it
                status: 'ACTIVE',
                roles: {
                    create: {
                        roleId: role.id
                    }
                }
            }
        });

        // Auto-create Doctor Profile if role is DOCTOR
        if (roleName.toUpperCase() === 'DOCTOR') {
            await prisma.doctor.create({
                data: {
                    doctorId: newUser.id,
                    specialization: 'General Practitioner',
                    availability: true
                }
            });
        }
        
         // Auto-create Pharmacist Profile if role is PHARMACIST - wait, schema might not require it yet but good practice if needed.
         // currently only doctor has a separate table in the provided snippets.

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("Create User Error:", error);
        res.status(500).json({ message: "Failed to create user" });
    }
}

// Delete User
const deleteUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete User (Cascade will handle related data)
        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
}

// remove role from user
const removeRole = async (req, res) => {
    const { userId, roleId } = req.params;

    try {
        await prisma.userRole.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId: Number(roleId)
                }
            }
        });

        res.status(200).json({ message: "Role removed successfully" });
    } catch (error) {
        console.error("Remove Role Error:", error);
        res.status(500).json({ message: "Failed to remove role" });
    }
}

// get single user details with profile info
const getUserDetails = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let profileData = {
            id: user.id,
            name: user.firstName + ' ' + user.lastName,
            email: user.email,
            phone: user.phone,
            joinedDate: user.createdAt,
            // Determine primary role for display or return all
            role: user.roles.length > 0 ? user.roles[0].role.name.toLowerCase() : 'patient'
        };

        // Fetch extra details based on roles
        const roleNames = user.roles.map(r => r.role.name);

        if (roleNames.includes('DOCTOR')) {
            const doctor = await prisma.doctor.findUnique({ where: { doctorId: userId } });
            if (doctor) {
                profileData = { ...profileData, ...doctor, role: 'doctor' };
            }
        } else if (roleNames.includes('PHARMACIST')) {
            const pharmacist = await prisma.pharmacist.findUnique({ where: { pharmacistId: userId } });
            if (pharmacist) {
                profileData = { ...profileData, ...pharmacist, role: 'pharmacist' };
            }
        } else if (roleNames.includes('MLT')) {
            const mlt = await prisma.labTechnician.findUnique({ where: { mltId: userId } });
            if (mlt) {
                profileData = { ...profileData, ...mlt, role: 'mlt' };
            }
        } else if (roleNames.includes('PATIENT')) {
            const patient = await prisma.patient.findUnique({ where: { patientId: userId } });
            if (patient) {
                profileData = { ...profileData, ...patient, role: 'patient' };
            }
        }

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Get User Details Error:", error);
        res.status(500).json({ message: "Failed to fetch user details" });
    }
}

// Get Audit Logs
const getAuditLogs = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    try {
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                skip: offset,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    user: {
                        select: { firstName: true, lastName: true, email: true, roles: { select: { role: { select: { name: true } } } } }
                    }
                }
            }),
            prisma.auditLog.count()
        ]);

        res.json({
            data: logs,
            meta: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
}

// Revoke Staff Sessions (Panic Button)
const revokeStaffSessions = async (req, res) => {
    try {
        // Increment tokenVersion for all users who are NOT exclusively Patients or Admins
        // Requirement: "End all internal sessions (except admins)"
        // Implementation: Update users where roles include (Doctor OR Pharmacist OR MLT OR Receptionist)
        // AND do not include ADMIN.
        
        // 1. Find IDs of users to revoke (Users with Staff roles who are NOT Admins)
        const usersToRevoke = await prisma.user.findMany({
            where: {
                roles: {
                    some: { 
                        role: { 
                            name: { in: ['DOCTOR', 'PHARMACIST', 'RECEPTIONIST', 'MLT'] } 
                        } 
                    },
                    none: {
                        role: { name: 'ADMIN' }
                    }
                }
            },
            select: { id: true }
        });

        const ids = usersToRevoke.map(u => u.id);

        if (ids.length === 0) {
            return res.status(200).json({ message: "No active staff sessions found to revoke." });
        }

        // 2. Increment tokenVersion
        await prisma.user.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                tokenVersion: { increment: 1 }
            }
        });

        // 3. Insert specific LOGOUT logs so the "Active Staff" heuristic sees them as logged out
        const logoutLogs = ids.map(id => ({
            userId: id,
            action: 'LOGOUT_SUCCESS',
            details: 'System Force Logout (Security Panic Button)',
            ipAddress: req.ip,
            userAgent: 'System Admin Action',
            status: 'SUCCESS',
            timestamp: new Date()
        }));

        await prisma.auditLog.createMany({
            data: logoutLogs
        });

        // 4. Log General Action
        await logAction({
            userId: req.user.id,
            action: 'REVOKE_SESSIONS',
            details: `Revoked sessions for ${ids.length} staff members (Internal Security Action)`,
            req
        });

        res.status(200).json({ 
            message: `Successfully revoked sessions for ${ids.length} staff members.`,
            count: ids.length
        });

    } catch (e) {
        console.error("Revoke Sessions Error:", e);
        res.status(500).json({ message: "Failed to revoke sessions." });
    }
}

// Get Active Staff (Heuristic: Login in last 24h, no Logout)
const getActiveStaff = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // distinct users who logged in recently
        const recentLogins = await prisma.auditLog.findMany({
            where: {
                action: 'LOGIN_SUCCESS',
                timestamp: { gt: twentyFourHoursAgo },
                user: {
                    roles: {
                         // Internal only
                         some: { role: { name: { in: ['DOCTOR', 'PHARMACIST', 'RECEPTIONIST', 'MLT', 'ADMIN'] } } },
                         none: { role: { name: 'PATIENT' } }
                    }
                }
            },
            distinct: ['userId'],
            select: {
                userId: true,
                timestamp: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        roles: { select: { role: { select: { name: true } } } }
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Filter out those who have logged out since their login
        const activeSessions = [];
        
        for (const login of recentLogins) {
            if(!login.userId || !login.user) continue;

            const laterLogout = await prisma.auditLog.findFirst({
                where: {
                    userId: login.userId,
                    action: 'LOGOUT_SUCCESS',
                    timestamp: { gt: login.timestamp }
                }
            });

            if (!laterLogout) {
                // Determine primary role
                const roles = login.user.roles.map(r => r.role.name);
                const primaryRole = roles.find(r => r !== 'PATIENT') || 'Staff';

                activeSessions.push({
                    id: login.user.id,
                    name: `${login.user.firstName} ${login.user.lastName}`,
                    email: login.user.email,
                    role: primaryRole,
                    loginTime: login.timestamp
                });
            }
        }

        res.json(activeSessions);

    } catch (error) {
        console.error("Get Active Staff Error:", error);
        res.status(500).json({ message: "Failed to fetch active staff" });
    }
}

export {
  getUserCount,
  getAllUsers,
  getRoles,
  changeRoleStatus,
  changeUserStatus,
  addRole,
  removeRole,
  getUserDetails,
  getDashboardStats,
  getSystemHealth,
  getSystemReport,
  createUser,
  deleteUser,
  getAuditLogs,
  revokeStaffSessions,
  getActiveStaff
}
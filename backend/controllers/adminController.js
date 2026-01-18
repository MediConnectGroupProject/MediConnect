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
  const offset = (page - 1) * limit;

  const searchQ = search ? {
    OR: [{
        firstName: {
          contains: search,
          mode: 'insensitive',

        }
      },
      {
        lastName: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        email: {
          contains: search,
          mode: 'insensitive'
        }
      },
    ],

  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: searchQ,
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
      where: searchQ
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

  return res.status(200).json({
    message: 'Role added to user successfully'
  });
}

export {
  getUserCount,
  getAllUsers,
  getRoles,
  changeRoleStatus,
  changeUserStatus,
  addRole
}
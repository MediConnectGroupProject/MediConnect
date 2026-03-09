import {
  getUserCount,
  getAllUsers,
  getRoles,
  changeRoleStatus,
  changeUserStatus,
  getDashboardStats,
} from '../../controllers/adminController.js';
import prisma from '../../config/connection.js';

describe('Admin Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = global.testUtils.mockRequest();
    mockRes = global.testUtils.mockResponse();
    mockNext = global.testUtils.mockNext;
    jest.clearAllMocks();
  });

  describe('getUserCount', () => {
    it('should return user count successfully', async () => {
      const mockCount = 42;
      prisma.user.count.mockResolvedValue(mockCount);

      await getUserCount(mockReq, mockRes);

      expect(prisma.user.count).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCount);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      prisma.user.count.mockRejectedValue(error);

      await expect(getUserCount(mockReq, mockRes)).rejects.toThrow('Database error');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users successfully', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', firstName: 'John', lastName: 'Doe' }
      ];
      const mockTotal = 1;

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(mockTotal);

      mockReq.query = { page: '1', limit: '10' };

      await getAllUsers(mockReq, mockRes);

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.user.count).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockUsers,
        meta: {
          total: mockTotal,
          limit: 10,
          page: 1,
          totalPages: 1,
        }
      });
    });

    it('should filter users by search term', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      mockReq.query = { search: 'john' };

      await getAllUsers(mockReq, mockRes);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { firstName: { contains: 'john', mode: 'insensitive' } },
                  { lastName: { contains: 'john', mode: 'insensitive' } },
                  { email: { contains: 'john', mode: 'insensitive' } },
                ])
              })
            ])
          })
        })
      );
    });

    it('should filter internal users', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      mockReq.query = { type: 'internal' };

      await getAllUsers(mockReq, mockRes);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                roles: {
                  none: { role: { name: 'PATIENT' } }
                }
              })
            ])
          })
        })
      );
    });
  });

  describe('getRoles', () => {
    it('should return all roles successfully', async () => {
      const mockRoles = [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'DOCTOR' }
      ];

      prisma.role.findMany.mockResolvedValue(mockRoles);

      await getRoles(mockReq, mockRes);

      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockRoles
      });
    });
  });

  describe('changeRoleStatus', () => {
    it('should change role status successfully', async () => {
      const mockUpdatedRole = { id: 1, status: 'ACTIVE' };

      prisma.userRole.update.mockResolvedValue(mockUpdatedRole);

      mockReq.params = { userId: '1', roleId: '1' };
      mockReq.body = { status: 'ACTIVE' };

      await changeRoleStatus(mockReq, mockRes);

      expect(prisma.userRole.update).toHaveBeenCalledWith({
        where: {
          userId_roleId: {
            userId: '1',
            roleId: 1
          }
        },
        data: { status: 'ACTIVE' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Role updated'
      });
    });

    it('should return 400 if user role not found', async () => {
      prisma.userRole.update.mockRejectedValue({ code: 'P2025' });

      mockReq.params = { userId: '1', roleId: '1' };
      mockReq.body = { status: 'ACTIVE' };

      await changeRoleStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const mockUpdatedUser = { id: '1', status: 'ACTIVE' };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      mockReq.params = { userId: '1' };
      mockReq.body = { status: 'ACTIVE' };

      await changeUserStatus(mockReq, mockRes);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'ACTIVE' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Action updated successfully"
      });
    });
  });

  // Add more test cases for other functions as needed
  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        totalAppointments: 50,
        pendingAppointments: 10
      };

      // Mock all the database calls that getDashboardStats makes
      prisma.user.count.mockResolvedValue(100);
      prisma.appointment.count.mockResolvedValueOnce(50); // total
      prisma.appointment.count.mockResolvedValueOnce(10); // pending

      await getDashboardStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
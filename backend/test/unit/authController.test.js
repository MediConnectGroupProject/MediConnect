import { login, register, logout, verifyEmail, getMe } from '../../controllers/authController.js';
import prisma from '../../config/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import generateAuthToken from '../../utils/authToken.js';
import sendEmail from '../../utils/sendEmails.js';
import { getPrimaryRole } from '../../utils/getPrimaryRole.js';

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = global.testUtils.mockRequest();
    mockRes = global.testUtils.mockResponse();
    mockNext = global.testUtils.mockNext;
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = { id: 1, ...userData, password: 'hashedPassword' };
      const mockToken = 'mock-jwt-token';
      const mockRole = { id: 1, name: 'PATIENT' };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.systemSettings.findFirst.mockResolvedValue({ registrationEnabled: true });
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.role.findUnique.mockResolvedValue(mockRole);
      prisma.userRole.create.mockResolvedValue({});
      generateAuthToken.mockReturnValue(mockToken);
      sendEmail.mockResolvedValue();

      mockReq.body = userData;

      await register(mockReq, mockRes);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User registered successfully'
      }));
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      prisma.user.findUnique.mockResolvedValue({ id: 1, email: userData.email });

      mockReq.body = userData;

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User already exists'
      }));
    });

    it('should return 403 if registration is disabled', async () => {
      const userData = { email: 'john@example.com', password: 'password123' };
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.systemSettings.findFirst.mockResolvedValue({ registrationEnabled: false });

      mockReq.body = userData;

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = { email: 'john@example.com', password: 'password123' };
      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashedPassword',
        isEmailVerified: true,
        status: 'ACTIVE',
        roles: [{ role: { name: 'PATIENT' }, status: 'ACTIVE' }]
      };
      const mockToken = 'mock-jwt-token';

      prisma.user.findFirst.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateAuthToken.mockReturnValue(mockToken);

      mockReq.body = loginData;

      await login(mockReq, mockRes);

      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User logged in successfully'
      }));
    });

    it('should return 401 for invalid credentials (user not found)', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      mockReq.body = { email: 'john@example.com', password: 'password123' };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 for invalid credentials (wrong password)', async () => {
      const mockUser = { id: 1, password: 'hashedPassword', status: 'ACTIVE' };
      prisma.user.findFirst.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      mockReq.body = { email: 'john@example.com', password: 'wrong' };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'valid-token';
      prisma.user.findFirst.mockResolvedValue({ id: 1, isEmailVerified: false });
      prisma.user.update.mockResolvedValue({ id: 1, isEmailVerified: true });

      mockReq.query = { token };

      await verifyEmail(mockReq, mockRes);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid/expired token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      mockReq.query = { token: 'invalid' };

      await verifyEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      mockReq.user = { id: 1, email: 'john@example.com', firstName: 'John', lastName: 'Doe', roles: [] };

      await getMe(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.objectContaining({ id: 1 })
      }));
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await logout(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User logged out successfully'
      }));
    });
  });
});
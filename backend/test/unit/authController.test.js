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

      // Mock database calls
      prisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
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
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(generateAuthToken).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User registered successfully. Please check your email to verify your account.',
        token: mockToken,
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName
        })
      });
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
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User already exists'
      });
    });

    it('should return 403 if registration is disabled', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.systemSettings.findFirst.mockResolvedValue({ registrationEnabled: false });

      mockReq.body = userData;

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'New registrations are currently disabled by the administrator.'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashedPassword',
        isEmailVerified: true,
        status: 'ACTIVE'
      };

      const mockToken = 'mock-jwt-token';
      const mockRole = { name: 'PATIENT' };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      getPrimaryRole.mockResolvedValue(mockRole);
      generateAuthToken.mockReturnValue(mockToken);

      mockReq.body = loginData;

      await login(mockReq, mockRes);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
        include: expect.any(Object)
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(generateAuthToken).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: mockToken,
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email
        })
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashedPassword'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      mockReq.body = loginData;

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 403 for unverified email', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashedPassword',
        isEmailVerified: false
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      mockReq.body = loginData;

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Please verify your email before logging in'
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'valid-token';
      const decoded = { userId: 1 };

      jwt.verify.mockReturnValue(decoded);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        isEmailVerified: false
      });
      prisma.user.update.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        isEmailVerified: true
      });

      mockReq.body = { token };

      await verifyEmail(mockReq, mockRes);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isEmailVerified: true }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email verified successfully'
      });
    });

    it('should return 400 for invalid token', async () => {
      const token = 'invalid-token';

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockReq.body = { token };

      await verifyEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      });
    });
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: [{ role: { name: 'PATIENT' } }]
      };

      mockReq.user = { id: 1 };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await getMe(mockReq, mockRes);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: mockUser
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Logout typically just returns a success message
      // In a real implementation, you might blacklist tokens or clear sessions

      await logout(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Logged out successfully'
      });
    });
  });
});
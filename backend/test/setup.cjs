// Global test utilities
global.testUtils = {
  mockRequest: (body = {}, params = {}, query = {}, user = {}) => ({
    body,
    params,
    query,
    user,
  }),

  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  mockNext: jest.fn(),
};

const mockPrisma = {
  user: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  role: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  systemSettings: { findFirst: jest.fn(), update: jest.fn() },
  appointment: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
  prescription: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  doctorProfile: { findUnique: jest.fn(), upsert: jest.fn() },
  userRole: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn(), delete: jest.fn() },
  doctor: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  patient: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  labReport: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  notification: { findMany: jest.fn(), create: jest.fn() },
  bill: { findMany: jest.fn(), create: jest.fn() },
  auditLog: { findMany: jest.fn(), count: jest.fn(), createMany: jest.fn(), findFirst: jest.fn() },
  $queryRaw: jest.fn(),
};

// Mock Prisma client
jest.mock('../config/connection.js', () => ({
  __esModule: true,
  default: mockPrisma,
  ...mockPrisma
}), { virtual: true }); // virtual: true just in case

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Mock email utilities
jest.mock('../utils/sendEmails.js', () => ({
  default: jest.fn(),
}));

jest.mock('../utils/authToken.js', () => ({
  default: jest.fn(),
}));

jest.mock('../utils/getPrimaryRole.js', () => ({
  getPrimaryRole: jest.fn(),
}));

jest.mock('../utils/auditUtils.js', () => ({
  logAction: jest.fn(),
}));

jest.mock('../helpers/notificationHelper.js', () => ({
  createNotification: jest.fn(),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
  createHash: jest.fn(),
}));
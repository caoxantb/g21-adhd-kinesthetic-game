import { jest } from '@jest/globals';
import { User } from '../../models/index.js';
import { BadRequest, NotFound, Forbidden } from '../../utils/httpError.js';
import { mockResponse } from '../helpers/testHelpers.js';

// Mock functions
const mockCompare = jest.fn();
const mockHash = jest.fn();
const mockSign = jest.fn();

// Mock modules using unstable_mockModule for ES Module compatibility
await jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: mockCompare,
    hash: mockHash
  }
}));

await jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign
  }
}));

// Import controllers after mocking
const { 
  userLogin, 
  userRegister, 
  userLogout, 
  getCurrentUser, 
  getUserByUsername, 
  updateUser, 
  getUserLeaderboards 
} = await import('../../controllers/userController.js');

describe('User Controller Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRes = mockResponse();
    mockReq = {
      body: {},
      user: null,
      params: {},
      query: {}
    };
    jest.clearAllMocks();
  });

  describe('userLogin', () => {
    it('should throw BadRequest if credentials are invalid', async () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(userLogin(mockReq, mockRes))
        .rejects.toThrow(BadRequest);
    });

    it('should login successfully with valid credentials', async () => {
      const testUser = {
        username: 'testuser',
        passwordHash: 'hashedPassword123'
      };

      mockReq.body = {
        username: 'testuser',
        password: 'password123'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(testUser);
      mockCompare.mockResolvedValue(true);
      mockSign.mockReturnValue('mock-token');

      await userLogin(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'mock-token',
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(testUser);
    });
  });

  describe('userRegister', () => {
    it('should throw BadRequest if required fields are missing', async () => {
      mockReq.body = {
        username: 'testuser'
        // missing name and password
      };

      await expect(userRegister(mockReq, mockRes))
        .rejects.toThrow(BadRequest);
    });

    it('should throw BadRequest if password is too short', async () => {
      mockReq.body = {
        username: 'testuser',
        name: 'Test User',
        password: 'short'
      };

      await expect(userRegister(mockReq, mockRes))
        .rejects.toThrow(BadRequest);
    });

    it('should throw BadRequest if user already exists', async () => {
      mockReq.body = {
        username: 'testuser',
        name: 'Test User',
        password: 'password123'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue({ username: 'testuser' });

      await expect(userRegister(mockReq, mockRes))
        .rejects.toThrow(BadRequest);
    });

    it('should register new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'password123'
      };

      mockReq.body = newUser;

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      mockHash.mockResolvedValue('hashedPassword123');
      jest.spyOn(User.prototype, 'save').mockResolvedValue({
        ...newUser,
        passwordHash: 'hashedPassword123'
      });
      mockSign.mockReturnValue('mock-token');

      await userRegister(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'mock-token',
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('userLogout', () => {
    it('should throw BadRequest if no user is logged in', async () => {
      await expect(userLogout(mockReq, mockRes))
        .rejects.toThrow(BadRequest);
    });

    it('should logout successfully', async () => {
      mockReq.user = { username: 'testuser' };

      await userLogout(mockReq, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null if no user is logged in', async () => {
      await getCurrentUser(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(null);
    });

    it('should return current user if logged in', async () => {
      const testUser = { username: 'testuser' };
      mockReq.user = testUser;

      await getCurrentUser(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(testUser);
    });
  });

  describe('getUserByUsername', () => {
    it('should throw NotFound if user does not exist', async () => {
      mockReq.params = { username: 'nonexistent' };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(getUserByUsername(mockReq, mockRes))
        .rejects.toThrow(NotFound);
    });

    it('should return user if found', async () => {
      const testUser = { username: 'testuser' };
      mockReq.params = { username: 'testuser' };

      jest.spyOn(User, 'findOne').mockResolvedValue(testUser);

      await getUserByUsername(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(testUser);
    });
  });

  describe('updateUser', () => {
    it('should throw Forbidden if user tries to update another user', async () => {
      mockReq.params = { username: 'otheruser' };
      mockReq.user = { username: 'testuser' };

      await expect(updateUser(mockReq, mockRes))
        .rejects.toThrow(Forbidden);
    });

    it('should throw NotFound if user does not exist', async () => {
      mockReq.params = { username: 'testuser' };
      mockReq.user = { username: 'testuser' };

      jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(null);

      await expect(updateUser(mockReq, mockRes))
        .rejects.toThrow(NotFound);
    });

    it('should update user successfully', async () => {
      const testUser = { username: 'testuser', name: 'Updated Name' };
      mockReq.params = { username: 'testuser' };
      mockReq.user = { username: 'testuser' };
      mockReq.body = { name: 'Updated Name' };

      jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(testUser);

      await updateUser(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(testUser);
    });
  });

  describe('getUserLeaderboards', () => {
    it('should return leaderboards with default limit', async () => {
      const mockUsers = Array(5).fill({ username: 'testuser', score: 100 });
      
      jest.spyOn(User, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers)
      });

      await getUserLeaderboards(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should respect custom limit parameter', async () => {
      mockReq.query = { limit: 5 };
      const mockUsers = Array(5).fill({ username: 'testuser', score: 100 });

      const mockFind = jest.spyOn(User, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers)
      });

      await getUserLeaderboards(mockReq, mockRes);

      const limitFn = mockFind.mock.results[0].value.limit;
      expect(limitFn).toHaveBeenCalledWith(5);
    });
  });
});
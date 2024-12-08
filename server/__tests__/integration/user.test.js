// __tests__/integration/user.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { mockResponse } from '../config/setupTestDb.js';
import User from '../../models/userModel.js';

const createTestUserData = () => ({
  name: 'Test User',
  username: 'testuser',
  passwordHash: 'hashedpassword123',
  role: 'player',
  gameplaySettings: {
    numberOfBlocks: 4,
    blockJumpingDurations: [60, 60, 60, 60],
    blockPosingDurations: [10, 20, 30, 40]
  }
});

describe('User Model Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a new user successfully', async () => {
      const userData = createTestUserData();
      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.username).toBe(userData.username);
      expect(user.role).toBe(userData.role);
      expect(user.totalScore).toBe(0);
    });

    it('should fail to create user with duplicate username', async () => {
      const userData = createTestUserData();
      await User.create(userData);

      await expect(async () => {
        await User.create({
          ...userData,
          name: 'Different Name'
        });
      }).rejects.toThrow();
    });
  });

  describe('User Validation', () => {
    it('should validate required fields', async () => {
      const invalidUser = new User({});
      await expect(invalidUser.validate()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const invalidUser = new User({
        ...createTestUserData(),
        role: 'invalid-role'
      });

      await expect(invalidUser.validate()).rejects.toThrow();
    });

    it('should validate minimum blocks in gameplaySettings', async () => {
      const invalidUser = new User({
        ...createTestUserData(),
        gameplaySettings: {
          ...createTestUserData().gameplaySettings,
          numberOfBlocks: 1 // min is 2
        }
      });

      await expect(invalidUser.validate()).rejects.toThrow();
    });

    it('should validate non-negative totalScore', async () => {
      const invalidUser = new User({
        ...createTestUserData(),
        totalScore: -1
      });

      await expect(invalidUser.validate()).rejects.toThrow();
    });
  });
});
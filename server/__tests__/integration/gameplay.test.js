// __tests__/integration/gameplay.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { mockResponse } from '../config/setupTestDb.js';
import { saveGameplay } from '../../controllers/gameplayController.js';
import User from '../../models/userModel.js';
import Gameplay from '../../models/gameplayModel.js';

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

const createTestGameplayData = () => ({
  blocks: [
    {
      blockId: 1,
      jumpsSucceeded: 3,
      jumpsFailed: 1,
      averagePoseAccuracy: 85
    }
  ],
  score: 100
});

describe('Gameplay Controller Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Gameplay.deleteMany({});
  });

  describe('saveGameplay', () => {
    it('should save gameplay for authenticated user', async () => {
      const testUser = await User.create(createTestUserData());

      const req = {
        body: createTestGameplayData(),
        user: { username: testUser.username }
      };
      const res = mockResponse();

      await saveGameplay(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const savedGameplay = await Gameplay.findOne({ player: testUser.username });
      expect(savedGameplay).toBeTruthy();
      expect(savedGameplay.score).toBe(100);
    });
  });
});
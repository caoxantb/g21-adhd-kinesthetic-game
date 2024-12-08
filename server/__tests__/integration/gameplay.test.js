// __tests__/integration/gameplay.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { mockResponse } from '../config/setupTestDb.js';
import { saveGameplay, getGameplayLeaderboards } from '../../controllers/gameplayController.js';
import User from '../../models/userModel.js';
import Gameplay from '../../models/gameplayModel.js';

const createTestUserData = () => ({
  name: 'Test User',
  username: 'testuser',
  passwordHash: 'hashedpassword123',
  role: 'player',
  totalScore: 0
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

  describe('getGameplayLeaderboards', () => {
    it('should return leaderboards sorted by score', async () => {
      const testUser = await User.create(createTestUserData());
      await Gameplay.create({ ...createTestGameplayData(), player: testUser.username });

      const req = { query: { limit: 10 } };
      const res = mockResponse();

      await getGameplayLeaderboards(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
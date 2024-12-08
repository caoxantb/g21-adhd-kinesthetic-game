// server/__tests__/gameplayController.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { saveGameplay, getGameplayLeaderboars } from '../controllers/gameplayController.js';
import Gameplay from '../models/gameplayModel.js';
import User from '../models/userModel.js';

describe('Gameplay Controller Tests', () => {
  beforeEach(async () => {
    await Gameplay.deleteMany({});
    await User.deleteMany({});
  });

  describe('saveGameplay', () => {
    it('should save gameplay for authenticated user', async () => {
      // Create test user
      const user = await User.create({
        name: 'Test User',
        username: 'testuser',
        passwordHash: 'hashedpassword123',
        role: 'player'
      });

      const req = {
        body: {
          blocks: [
            {
              blockId: 1,
              jumpsSucceeded: 3,
              jumpsFailed: 1,
              averagePoseAccuracy: 85
            }
          ],
          score: 100
        },
        user: { username: 'testuser' }
      };
      const res = mockResponse();

      await saveGameplay(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const savedGameplay = await Gameplay.findOne({ player: 'testuser' });
      expect(savedGameplay).toBeTruthy();
      expect(savedGameplay.score).toBe(100);
    });
  });
});
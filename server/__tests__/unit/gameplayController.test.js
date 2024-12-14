import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { saveGameplay, getGameplayLeaderboards, getGameplayById, getGameplaysByPlayer } from '../../controllers/gameplayController.js';
import { mockResponse, createTestUserData, createTestGameplayData } from '../helpers/testHelpers.js';
import { NotFound, Unauthorized, Forbidden } from '../../utils/httpError.js';
import User from '../../models/userModel.js';
import Gameplay from '../../models/gameplayModel.js';

describe('Gameplay Controller Unit Tests', () => {
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

  describe('saveGameplay', () => {
    it('should throw Unauthorized if user is not logged in', async () => {
      mockReq.body = createTestGameplayData();
      
      await expect(saveGameplay(mockReq, mockRes)).rejects.toThrow(Unauthorized);
    });

    it('should save gameplay and update user total score', async () => {
      const testUser = createTestUserData();
      const testGameplay = createTestGameplayData();
      
      mockReq.user = { username: testUser.username };
      mockReq.body = testGameplay;

      // Mock User.findOne and user.save
      const mockUser = {
        username: testUser.username,
        totalScore: 0,
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      // Mock Gameplay.prototype.save
      const mockSave = jest.fn().mockResolvedValue({
        ...testGameplay,
        player: testUser.username
      });
      jest.spyOn(Gameplay.prototype, 'save').mockImplementation(mockSave);

      await saveGameplay(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockUser.totalScore).toBe(testGameplay.score);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('getGameplayLeaderboards', () => {
    it('should return leaderboards with default limit of 10', async () => {
      const mockGameplays = Array(5).fill(createTestGameplayData());
      jest.spyOn(Gameplay, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockGameplays)
      });

      await getGameplayLeaderboards(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockGameplays);
    });

    it('should respect custom limit parameter', async () => {
      mockReq.query = { limit: 5 };
      const mockGameplays = Array(5).fill(createTestGameplayData());
      
      const mockFind = jest.spyOn(Gameplay, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockGameplays)
      });

      await getGameplayLeaderboards(mockReq, mockRes);

      const limitFn = mockFind.mock.results[0].value.limit;
      expect(limitFn).toHaveBeenCalledWith(5);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getGameplayById', () => {
    it('should throw Unauthorized if user is not logged in', async () => {
      mockReq.params = { id: new mongoose.Types.ObjectId() };

      await expect(getGameplayById(mockReq, mockRes)).rejects.toThrow(Unauthorized);
    });

    it('should throw NotFound if gameplay does not exist', async () => {
      mockReq.user = { username: 'testuser' };
      mockReq.params = { id: new mongoose.Types.ObjectId() };
      
      jest.spyOn(Gameplay, 'findById').mockResolvedValue(null);

      await expect(getGameplayById(mockReq, mockRes)).rejects.toThrow(NotFound);
    });

    it('should throw Forbidden if non-admin user tries to access another user\'s gameplay', async () => {
      const testGameplay = { ...createTestGameplayData(), player: 'otheruser' };
      mockReq.user = { username: 'testuser', role: 'player' };
      mockReq.params = { id: new mongoose.Types.ObjectId() };

      jest.spyOn(Gameplay, 'findById').mockResolvedValue(testGameplay);

      await expect(getGameplayById(mockReq, mockRes)).rejects.toThrow(Forbidden);
    });

    it('should return gameplay for admin user', async () => {
      const testGameplay = createTestGameplayData();
      mockReq.user = { username: 'admin', role: 'admin' };
      mockReq.params = { id: new mongoose.Types.ObjectId() };

      jest.spyOn(Gameplay, 'findById').mockResolvedValue(testGameplay);

      await getGameplayById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(testGameplay);
    });
  });

  describe('getGameplaysByPlayer', () => {
    it('should throw Unauthorized if user is not logged in', async () => {
      mockReq.params = { username: 'testuser' };

      await expect(getGameplaysByPlayer(mockReq, mockRes)).rejects.toThrow(Unauthorized);
    });

    it('should throw Forbidden if non-admin user tries to access another user\'s gameplays', async () => {
      mockReq.user = { username: 'testuser', role: 'player' };
      mockReq.params = { username: 'otheruser' };

      await expect(getGameplaysByPlayer(mockReq, mockRes)).rejects.toThrow(Forbidden);
    });

    it('should return user\'s own gameplays', async () => {
      const testGameplays = [createTestGameplayData()];
      mockReq.user = { username: 'testuser', role: 'player' };
      mockReq.params = { username: 'testuser' };

      jest.spyOn(Gameplay, 'find').mockResolvedValue(testGameplays);

      await getGameplaysByPlayer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(testGameplays);
    });

    it('should return any user\'s gameplays for admin', async () => {
      const testGameplays = [createTestGameplayData()];
      mockReq.user = { username: 'admin', role: 'admin' };
      mockReq.params = { username: 'testuser' };

      jest.spyOn(Gameplay, 'find').mockResolvedValue(testGameplays);

      await getGameplaysByPlayer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(testGameplays);
    });
  });
});
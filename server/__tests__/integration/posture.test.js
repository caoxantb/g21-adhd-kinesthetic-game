// __tests__/integration/posture.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { mockResponse } from '../config/setupTestDb.js';
import { getAllPostures, getPostureById } from '../../controllers/postureController.js';
import Posture from '../../models/postureModel.js';

const createTestPosture = () => ({
  _id: 'test-posture-1',
  name: 'Test Posture',
  alpha: 90,  // Added required field
  beta: 90,   // Added required field
  url: 'http://example.com/posture',
  handsOnOneSide: false
});

describe('Posture Controller Tests', () => {
  beforeEach(async () => {
    await Posture.deleteMany({});
  });

  describe('getAllPostures', () => {
    it('should return all postures', async () => {
      // Create test postures
      const posture1 = await Posture.create(createTestPosture());
      const posture2 = await Posture.create({
        ...createTestPosture(),
        _id: 'test-posture-2',
        name: 'Test Posture 2'
      });

      const req = {};
      const res = mockResponse();

      await getAllPostures(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveLength(2);
      expect(responseData[0].name).toBe('Test Posture');
      expect(responseData[1].name).toBe('Test Posture 2');
    });

    it('should return empty array when no postures exist', async () => {
      const req = {};
      const res = mockResponse();

      await getAllPostures(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveLength(0);
    });
  });
});
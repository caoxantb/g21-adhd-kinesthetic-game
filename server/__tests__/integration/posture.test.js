// __tests__/integration/posture.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { mockResponse } from '../config/setupTestDb.js';
import { getAllPostures, getPostureById } from '../../controllers/postureController.js';
import { Posture } from '../../models/index.js';

const createTestPosture = () => ({
  _id: 'test-posture-1',
  name: 'Test Posture',
  description: 'Test Description'
});

describe('Posture Controller Tests', () => {
  beforeEach(async () => {
    await Posture.deleteMany({});
  });

  describe('getAllPostures', () => {
    it('should return all postures', async () => {
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
  });
});
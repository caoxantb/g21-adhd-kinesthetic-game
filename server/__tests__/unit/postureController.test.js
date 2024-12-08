import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { getAllPostures, getPostureById } from '../../controllers/postureController.js';
import { mockResponse } from '../helpers/testHelpers.js';
import { NotFound } from '../../utils/httpError.js';
import Posture from '../../models/postureModel.js';

describe('Posture Controller Unit Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRes = mockResponse();
    mockReq = {
      params: {},
      query: {}
    };
    jest.clearAllMocks();
  });

  describe('getAllPostures', () => {
    it('should return all postures', async () => {
      const mockPostures = [
        { name: 'Posture 1', alpha: 90, beta: 90, url: 'http://example.com/posture1', handsOnOneSide: false },
        { name: 'Posture 2', alpha: 90, beta: 90, url: 'http://example.com/posture2', handsOnOneSide: false }
      ];

      jest.spyOn(Posture, 'find').mockResolvedValue(mockPostures);

      await getAllPostures(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockPostures);
    });
  });

  describe('getPostureById', () => {
    it('should throw NotFound if posture does not exist', async () => {
      mockReq.params = { id: new mongoose.Types.ObjectId() };

      jest.spyOn(Posture, 'findById').mockResolvedValue(null);

      await expect(getPostureById(mockReq, mockRes)).rejects.toThrow(NotFound);
    });

    it('should return posture if found', async () => {
      const mockPosture = { name: 'Posture 1', alpha: 90, beta: 90, url: 'http://example.com/posture1', handsOnOneSide: false };
      mockReq.params = { id: new mongoose.Types.ObjectId() };

      jest.spyOn(Posture, 'findById').mockResolvedValue(mockPosture);

      await getPostureById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockPosture);
    });
  });
});
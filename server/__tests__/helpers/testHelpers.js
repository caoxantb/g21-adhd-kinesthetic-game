// __tests__/helpers/testHelpers.js
import { jest } from '@jest/globals';

export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.app = {
    get: jest.fn().mockReturnValue({})
  };
  return res;
};

export const createTestUserData = ({
  name = 'Test User',
  username = 'testuser',
  passwordHash = 'hashedpassword123',
  role = 'player'
} = {}) => ({
  name,
  username,
  passwordHash,
  role,
  gameplaySettings: {
    numberOfBlocks: 4,
    blockJumpingDurations: [60, 60, 60, 60],
    blockPosingDurations: [10, 20, 30, 40]
  }
});

export const createTestGameplayData = ({
  player = 'testuser',
  score = 100,
  blockId = 1,
  jumpsSucceeded = 3,
  jumpsFailed = 1,
  averagePoseAccuracy = 85
} = {}) => ({
  player,
  score,
  blocks: [
    {
      blockId,
      jumpsSucceeded,
      jumpsFailed,
      averagePoseAccuracy
    }
  ]
});
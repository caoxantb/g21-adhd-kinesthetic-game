// __tests__/config/setupTestDb.js
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod = null;

beforeAll(async () => {
  if (!mongod) {
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'jest'
      }
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  }
}, 30000); // Increased timeout to 30 seconds

afterAll(async () => {
  if (mongod) {
    await mongoose.disconnect();
    await mongod.stop();
    mongod = null;
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

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
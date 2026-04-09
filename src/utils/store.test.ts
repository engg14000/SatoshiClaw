import fs from 'fs';
import path from 'path';
import { JSONStore } from './store';
import { logger } from './logger';

jest.mock('fs');
jest.mock('./logger');

describe('JSONStore', () => {
  const mockFilename = 'test-store.json';
  const mockData = { test: 'data' };
  let mockFilePath: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFilePath = path.resolve(process.cwd(), mockFilename);
  });

  describe('save', () => {
    it('should successfully save data to file', () => {
      // Mock that file doesn't exist initially to skip load() error logging
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const store = new JSONStore(mockFilename, mockData);

      // Clear mocks to reset state after load()
      jest.clearAllMocks();

      store.save();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockFilePath,
        JSON.stringify(mockData, null, 2)
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle write errors and log them', () => {
      // Mock that file doesn't exist initially to skip load() error logging
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const store = new JSONStore(mockFilename, mockData);

      // Clear mocks to reset state after load()
      jest.clearAllMocks();

      const error = new Error('Permission denied');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      store.save();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockFilePath,
        JSON.stringify(mockData, null, 2)
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to save store ${mockFilePath}:`,
        error
      );
    });
  });
});

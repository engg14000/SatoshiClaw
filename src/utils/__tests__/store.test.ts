import fs from 'fs';
import { JSONStore } from '../store';
import { logger } from '../logger';

// Mock the modules
jest.mock('fs');
jest.mock('../logger');

interface TestData {
  count: number;
  items: string[];
}

describe('JSONStore', () => {
  const mockFilename = 'test-store.json';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // We don't want tests to write actual files or read actual files.
    // So we assume path.resolve just gives back the filename for simplicity in the tests,
    // or we mock fs functions heavily.

    // Mock logger to avoid noisy test output
    (logger.info as jest.Mock).mockImplementation(() => {});
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  describe('load()', () => {
    it('should load data from file if it exists', () => {
      // Arrange
      const existingData: TestData = { count: 5, items: ['apple'] };
      const defaultData: TestData = { count: 0, items: [] };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(existingData));

      // Act
      const store = new JSONStore<TestData>(mockFilename, defaultData);

      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(mockFilename));
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining(mockFilename), 'utf-8');
      expect(store.get()).toEqual(existingData);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Loaded store from'));
    });

    it('should create new store with default data if file does not exist', () => {
      // Arrange
      const defaultData: TestData = { count: 0, items: [] };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      // When saving new data, we expect it to write the defaultData
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

      // Act
      const store = new JSONStore<TestData>(mockFilename, defaultData);

      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(mockFilename));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Creating new store at'));
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(mockFilename),
        JSON.stringify(defaultData, null, 2)
      );
      expect(store.get()).toEqual(defaultData);
    });

    it('should log an error and use default data if parsing fails', () => {
      // Arrange
      const defaultData: TestData = { count: 0, items: [] };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json data');

      // Act
      const store = new JSONStore<TestData>(mockFilename, defaultData);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load store'),
        expect.any(SyntaxError)
      );
      // Since parsing failed before this.data was overwritten, it should retain defaultData
      expect(store.get()).toEqual(defaultData);
    });

    it('should log an error if readFileSync throws an error', () => {
      const defaultData: TestData = { count: 0, items: [] };
      const testError = new Error('Permission denied');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw testError;
      });

      const store = new JSONStore<TestData>(mockFilename, defaultData);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load store'),
        testError
      );
      expect(store.get()).toEqual(defaultData);
    });
  });

  describe('save()', () => {
    it('should save data to file', () => {
      // Arrange
      const defaultData: TestData = { count: 0, items: [] };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const store = new JSONStore<TestData>(mockFilename, defaultData);

      // Act
      store.save();

      // Assert
      // First call was from constructor -> load() -> save() because file didn't exist
      // Second call is our explicit store.save()
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(fs.writeFileSync).toHaveBeenLastCalledWith(
        expect.stringContaining(mockFilename),
        JSON.stringify(defaultData, null, 2)
      );
    });

    it('should log an error if saving fails', () => {
      // Arrange
      const defaultData: TestData = { count: 0, items: [] };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.writeFileSync as jest.Mock).mockClear(); // clean up any previous mock setups
      // Instead of relying on specific mockImplementationOnce setup for constructor vs explicit save,
      // let's create the store when it won't throw on constructor (file exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(defaultData));

      const store = new JSONStore<TestData>(mockFilename, defaultData);

      const testError = new Error('Disk full');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw testError;
      });

      // Act
      store.save();

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save store'),
        testError
      );
    });
  });

  describe('update()', () => {
    it('should update data and save', () => {
      // Arrange
      const defaultData: TestData = { count: 0, items: [] };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const store = new JSONStore<TestData>(mockFilename, defaultData);
      (fs.writeFileSync as jest.Mock).mockClear(); // clear the writeFileSync from constructor

      // Act
      store.update((data) => {
        data.count = 10;
        data.items.push('banana');
      });

      // Assert
      expect(store.get()).toEqual({ count: 10, items: ['banana'] });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(mockFilename),
        JSON.stringify({ count: 10, items: ['banana'] }, null, 2)
      );
    });
  });
});

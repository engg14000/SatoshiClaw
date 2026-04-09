import fs from 'fs';
import path from 'path';
import { JSONStore } from './store';
import { logger } from './logger';

jest.mock('fs');
jest.mock('path');
jest.mock('./logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

describe('JSONStore', () => {
  const defaultData = { count: 0 };
  const filename = 'test-store.json';
  const resolvedPath = '/resolved/path/test-store.json';

  beforeEach(() => {
    jest.clearAllMocks();
    (path.resolve as jest.Mock).mockReturnValue(resolvedPath);
  });

  it('handles corrupted JSON during load', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('{ invalid json }');

    const store = new JSONStore(filename, defaultData);

    expect(fs.readFileSync).toHaveBeenCalledWith(resolvedPath, 'utf-8');
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to load store ${resolvedPath}:`,
      expect.any(SyntaxError)
    );
    expect(store.get()).toEqual(defaultData);
  });

  it('loads valid JSON successfully', () => {
    const validData = { count: 10 };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(validData));

    const store = new JSONStore(filename, defaultData);

    expect(store.get()).toEqual(validData);
    expect(logger.info).toHaveBeenCalledWith(`Loaded store from ${resolvedPath}`);
  });

  it('creates new store when file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const store = new JSONStore(filename, defaultData);

    expect(logger.info).toHaveBeenCalledWith(`Creating new store at ${resolvedPath}`);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      resolvedPath,
      JSON.stringify(defaultData, null, 2)
    );
  });

  it('saves data successfully', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const store = new JSONStore(filename, defaultData);
    jest.clearAllMocks();

    store.save();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      resolvedPath,
      JSON.stringify(defaultData, null, 2)
    );
  });

  it('handles error during save', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const store = new JSONStore(filename, defaultData);
    jest.clearAllMocks();

    const error = new Error('Write failed');
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw error;
    });

    store.save();

    expect(logger.error).toHaveBeenCalledWith(
      `Failed to save store ${resolvedPath}:`,
      error
    );
  });

  it('updates data and saves', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const store = new JSONStore(filename, defaultData);
    jest.clearAllMocks();

    store.update((data) => {
      data.count = 42;
    });

    expect(store.get()).toEqual({ count: 42 });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      resolvedPath,
      JSON.stringify({ count: 42 }, null, 2)
    );
  });
});

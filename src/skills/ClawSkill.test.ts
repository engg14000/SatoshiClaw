import { ClawSkill } from './ClawSkill';
import { JSONStore } from '../utils/store';
import { generateRandomKey, isSatoshi } from '../utils/crypto';
import { logger } from '../utils/logger';

// Mock the dependencies
jest.mock('../utils/store');
jest.mock('../utils/crypto');
jest.mock('../utils/logger');

describe('ClawSkill Mining Loop', () => {
  let clawSkill: ClawSkill;
  let mockStoreGet: jest.Mock;
  let mockStoreSave: jest.Mock;
  let mockStats: any;

  beforeEach(() => {
    jest.useFakeTimers();

    // Reset mocks
    jest.clearAllMocks();

    mockStats = {
      totalAttempts: 0,
      lastAttemptTime: 0,
      keysFound: 0,
      satoshiFound: false,
      startTime: 0
    };

    mockStoreGet = jest.fn().mockReturnValue(mockStats);
    mockStoreSave = jest.fn();

    // Setup JSONStore mock implementation
    (JSONStore as jest.Mock).mockImplementation(() => ({
      get: mockStoreGet,
      save: mockStoreSave,
    }));

    (generateRandomKey as jest.Mock).mockReturnValue({
      privateKey: 'mockPrivKey',
      address: 'mockAddress',
      wif: 'mockWif'
    });

    (isSatoshi as jest.Mock).mockReturnValue(false);

    // Initialize ClawSkill
    clawSkill = new ClawSkill();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should perform 100 claws every 100ms', () => {
    // Fast-forward 100ms
    jest.advanceTimersByTime(100);

    // performClaws(100) should be called once, leading to 100 calls of generateRandomKey
    expect(generateRandomKey).toHaveBeenCalledTimes(100);
    expect(mockStats.totalAttempts).toBe(100);
    expect(mockStoreSave).not.toHaveBeenCalled(); // save is only every 5s

    // Fast-forward another 100ms
    jest.advanceTimersByTime(100);
    expect(generateRandomKey).toHaveBeenCalledTimes(200);
    expect(mockStats.totalAttempts).toBe(200);
  });

  it('should save stats every 5000ms', () => {
    // Fast-forward 5000ms
    jest.advanceTimersByTime(5000);

    // 5000ms / 100ms = 50 intervals of mining
    expect(generateRandomKey).toHaveBeenCalledTimes(50 * 100);
    expect(mockStats.totalAttempts).toBe(50 * 100);

    // Should have saved once at 5000ms
    expect(mockStoreSave).toHaveBeenCalledTimes(1);

    // Advance another 5000ms
    jest.advanceTimersByTime(5000);
    expect(mockStoreSave).toHaveBeenCalledTimes(2);
  });

  it('should update satoshiFound and log when Satoshi is found', () => {
    // Make the first key generated be a Satoshi key
    (isSatoshi as jest.Mock).mockReturnValueOnce(true);

    // Fast-forward 100ms to trigger one performClaws(100)
    jest.advanceTimersByTime(100);

    expect(generateRandomKey).toHaveBeenCalledTimes(100);
    expect(mockStats.satoshiFound).toBe(true);
    expect(logger.error).toHaveBeenCalledWith('HOLY CRAP WE FOUND SATOSHI: mockAddress');
  });

  it('should not start multiple mining loops if startMiningLoop is called again', () => {
    // startMiningLoop is called in constructor
    const initialTimersCount = jest.getTimerCount();

    // Call it manually again (it's private, so we cast to any)
    (clawSkill as any).startMiningLoop();

    // Should not create new timers
    expect(jest.getTimerCount()).toBe(initialTimersCount);
  });
});

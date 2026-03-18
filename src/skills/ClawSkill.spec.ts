import { ClawSkill } from './ClawSkill';
import { logger } from '../utils/logger';
import { JSONStore } from '../utils/store';
import { AgentContext } from '../core/types';

jest.mock('../utils/logger');
jest.mock('../utils/store');

describe('ClawSkill', () => {
  let skill: ClawSkill;
  let mockStoreGet: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    mockStoreGet = jest.fn().mockReturnValue({
      totalAttempts: 0,
      lastAttemptTime: Date.now(),
      keysFound: 0,
      satoshiFound: false,
      startTime: Date.now()
    });

    // Mock JSONStore implementation
    (JSONStore as jest.Mock).mockImplementation(() => {
      return {
        get: mockStoreGet,
        save: jest.fn(),
        update: jest.fn()
      };
    });

    skill = new ClawSkill();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('onHeartbeat', () => {
    it('should log an info message when totalAttempts is a multiple of 1000', async () => {
      mockStoreGet.mockReturnValue({
        totalAttempts: 1000,
        lastAttemptTime: Date.now(),
        keysFound: 0,
        satoshiFound: false,
        startTime: Date.now()
      });

      const mockAgent = {} as AgentContext;
      await skill.onHeartbeat(mockAgent);

      expect(logger.info).toHaveBeenCalledWith(
        '[Heartbeat] Still clawing. Total attempts: 1000'
      );
    });

    it('should log an info message when totalAttempts is 2000 (multiple of 1000)', async () => {
      mockStoreGet.mockReturnValue({
        totalAttempts: 2000,
        lastAttemptTime: Date.now(),
        keysFound: 0,
        satoshiFound: false,
        startTime: Date.now()
      });

      const mockAgent = {} as AgentContext;
      await skill.onHeartbeat(mockAgent);

      expect(logger.info).toHaveBeenCalledWith(
        '[Heartbeat] Still clawing. Total attempts: 2000'
      );
    });

    it('should not log an info message when totalAttempts is not a multiple of 1000', async () => {
      mockStoreGet.mockReturnValue({
        totalAttempts: 999,
        lastAttemptTime: Date.now(),
        keysFound: 0,
        satoshiFound: false,
        startTime: Date.now()
      });

      const mockAgent = {} as AgentContext;
      await skill.onHeartbeat(mockAgent);

      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log an info message when totalAttempts is 0', async () => {
      mockStoreGet.mockReturnValue({
        totalAttempts: 0,
        lastAttemptTime: Date.now(),
        keysFound: 0,
        satoshiFound: false,
        startTime: Date.now()
      });

      const mockAgent = {} as AgentContext;
      await skill.onHeartbeat(mockAgent);

      expect(logger.info).toHaveBeenCalledWith(
        '[Heartbeat] Still clawing. Total attempts: 0'
      );
    });
  });
});

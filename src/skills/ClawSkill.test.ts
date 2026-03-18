import { ClawSkill } from './ClawSkill';
import { JSONStore } from '../utils/store';
import { getProbabilityOfFindingSatoshi } from '../utils/crypto';
import { getRandomMeme } from '../utils/memes';
import { Message, AgentContext } from '../core/types';

jest.mock('../utils/store');
jest.mock('../utils/crypto', () => ({
  generateRandomKey: jest.fn(),
  isSatoshi: jest.fn(),
  getProbabilityOfFindingSatoshi: jest.fn()
}));
jest.mock('../utils/memes', () => ({
  getRandomMeme: jest.fn(),
  FAILURE_MEMES: [],
  STATUS_MEMES: []
}));
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('ClawSkill', () => {
  let skill: ClawSkill;
  let mockAgent: AgentContext;
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    jest.clearAllMocks();

    mockGet = jest.fn();
    (JSONStore as jest.Mock).mockImplementation(() => ({
      get: mockGet,
      save: jest.fn(),
      update: jest.fn()
    }));

    (getProbabilityOfFindingSatoshi as jest.Mock).mockReturnValue('1 in 2^256');
    (getRandomMeme as jest.Mock).mockReturnValue('MOCK MEME');

    mockAgent = {
      sendMessage: jest.fn(),
      broadcast: jest.fn(),
      logger: {},
      config: {}
    };

    skill = new ClawSkill();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('/status command', () => {
    it('should format stats correctly when satoshi is not found', async () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const mockStats = {
        totalAttempts: 1234567,
        startTime: now - 120000, // 2 minutes ago
        keysFound: 42,
        satoshiFound: false,
        lastAttemptTime: now
      };
      mockGet.mockReturnValue(mockStats);

      const message: Message = {
        id: 'msg-1',
        content: '/status',
        sender: 'user-1',
        chatId: 'chat-1',
        gateway: 'telegram',
        timestamp: now
      };

      await skill.execute(message, [], mockAgent);

      expect(mockAgent.sendMessage).toHaveBeenCalledTimes(1);

      const expectedResponse = `
📊 *SATHOSHICLAW STATUS* 📊
--------------------------------
🦞 Total Claws: 1,234,567
⏱ Uptime: 2.00 minutes
⚡ Hashrate: 1 kH/s (Meme Power)
💀 Keys Found: 42
🏆 Satoshi Found: NO
--------------------------------
💬 MOCK MEME
probability: 1 in 2^256
`;
      expect(mockAgent.sendMessage).toHaveBeenCalledWith('telegram', 'chat-1', expectedResponse);
    });

    it('should format satoshiFound correctly when true', async () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const mockStats = {
        totalAttempts: 999,
        startTime: now - 60000,
        keysFound: 1,
        satoshiFound: true,
        lastAttemptTime: now
      };
      mockGet.mockReturnValue(mockStats);

      const message: Message = {
        id: 'msg-1',
        content: '/status',
        sender: 'user-1',
        chatId: 'chat-1',
        gateway: 'telegram',
        timestamp: now
      };

      await skill.execute(message, [], mockAgent);

      const response = (mockAgent.sendMessage as jest.Mock).mock.calls[0][2];
      expect(response).toContain('🏆 Satoshi Found: YES (Liar)');
    });
  });
});

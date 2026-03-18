import { ClawSkill } from '../../src/skills/ClawSkill';
import { AgentContext, Message } from '../../src/core/types';
import { JSONStore } from '../../src/utils/store';
import { getRandomMeme } from '../../src/utils/memes';
import { getProbabilityOfFindingSatoshi } from '../../src/utils/crypto';

// Mock dependencies
jest.mock('../../src/utils/store');
jest.mock('../../src/utils/memes');
jest.mock('../../src/utils/crypto');

describe('ClawSkill', () => {
  let clawSkill: ClawSkill;
  let mockAgentContext: jest.Mocked<AgentContext>;
  let mockStoreGet: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup mock store
    mockStoreGet = jest.fn().mockReturnValue({
      totalAttempts: 1337,
      startTime: Date.now() - 60000 * 5, // 5 minutes ago
      keysFound: 0,
      satoshiFound: false,
      lastAttemptTime: Date.now()
    });

    (JSONStore as jest.Mock).mockImplementation(() => ({
      get: mockStoreGet,
      save: jest.fn(),
      update: jest.fn()
    }));

    // Setup mock utils
    (getRandomMeme as jest.Mock).mockReturnValue('Mocked Meme');
    (getProbabilityOfFindingSatoshi as jest.Mock).mockReturnValue('1 in 2^256');

    // Setup mock agent
    mockAgentContext = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
      start: jest.fn(),
      stop: jest.fn(),
      registerSkill: jest.fn(),
      registerGateway: jest.fn(),
      skills: [],
      gateways: []
    } as unknown as jest.Mocked<AgentContext>;

    clawSkill = new ClawSkill();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('/status command', () => {
    it('should output the correct status message', async () => {
      const message: Message = {
        id: 'msg-1',
        chatId: 'chat-1',
        content: '/status',
        gateway: 'mock-gateway',
        sender: 'user-1',
        timestamp: Date.now()
      };

      await clawSkill.execute(message, [], mockAgentContext);

      expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);

      const sentGateway = mockAgentContext.sendMessage.mock.calls[0][0];
      const sentChatId = mockAgentContext.sendMessage.mock.calls[0][1];
      const sentResponse = mockAgentContext.sendMessage.mock.calls[0][2];

      expect(sentGateway).toBe('mock-gateway');
      expect(sentChatId).toBe('chat-1');

      // Verify the formatted string contains expected mocked values
      expect(sentResponse).toContain('📊 *SATHOSHICLAW STATUS* 📊');
      expect(sentResponse).toContain('🦞 Total Claws: 1,337');
      expect(sentResponse).toContain('⏱ Uptime: 5.00 minutes');
      expect(sentResponse).toContain('⚡ Hashrate: 1 kH/s (Meme Power)');
      expect(sentResponse).toContain('💀 Keys Found: 0');
      expect(sentResponse).toContain('🏆 Satoshi Found: NO');
      expect(sentResponse).toContain('💬 Mocked Meme');
      expect(sentResponse).toContain('probability: 1 in 2^256');
    });

    it('should output truthy values if satoshi was "found"', async () => {
      // Modify the mock to return satoshiFound as true and keysFound > 0
      mockStoreGet.mockReturnValueOnce({
        totalAttempts: 9001,
        startTime: Date.now() - 60000 * 10, // 10 minutes ago
        keysFound: 1,
        satoshiFound: true,
        lastAttemptTime: Date.now()
      });

      const message: Message = {
        id: 'msg-2',
        chatId: 'chat-2',
        content: '/status',
        gateway: 'mock-gateway',
        sender: 'user-2',
        timestamp: Date.now()
      };

      await clawSkill.execute(message, [], mockAgentContext);

      const sentResponse = mockAgentContext.sendMessage.mock.calls[0][2];

      expect(sentResponse).toContain('🦞 Total Claws: 9,001');
      expect(sentResponse).toContain('⏱ Uptime: 10.00 minutes');
      expect(sentResponse).toContain('💀 Keys Found: 1');
      expect(sentResponse).toContain('🏆 Satoshi Found: YES (Liar)');
    });
  });
});

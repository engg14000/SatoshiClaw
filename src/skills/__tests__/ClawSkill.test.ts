import { ClawSkill } from '../ClawSkill';
import { Message, AgentContext } from '../../core/types';
import * as cryptoUtils from '../../utils/crypto';
import * as memeUtils from '../../utils/memes';
import { JSONStore } from '../../utils/store';

// Mock the dependencies
jest.mock('../../utils/crypto');
jest.mock('../../utils/memes');
jest.mock('../../utils/store');

describe('ClawSkill', () => {
  let clawSkill: ClawSkill;
  let mockAgentContext: jest.Mocked<AgentContext>;
  let mockStore: jest.Mocked<JSONStore<any>>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup store mock
    mockStore = {
      get: jest.fn().mockReturnValue({
        totalAttempts: 1000,
        lastAttemptTime: Date.now(),
        keysFound: 0,
        satoshiFound: false,
        startTime: Date.now()
      }),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<JSONStore<any>>;

    (JSONStore as jest.Mock).mockImplementation(() => mockStore);

    // Setup crypto mock
    const mockedGenerateRandomKey = cryptoUtils.generateRandomKey as jest.Mock;
    mockedGenerateRandomKey.mockReturnValue({
      privateKey: '1234567890abcdef1234567890abcdef',
      address: '1MockAddressForTestingOnly',
      wif: 'mockWif'
    });

    // Setup meme mock
    const mockedGetRandomMeme = memeUtils.getRandomMeme as jest.Mock;
    mockedGetRandomMeme.mockReturnValue('MOCK_MEME_TEXT');

    // Create the skill instance
    clawSkill = new ClawSkill();

    // Setup agent context mock
    mockAgentContext = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
      broadcast: jest.fn().mockResolvedValue(undefined),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      },
      config: {}
    };
  });

  afterEach(() => {
    // Clean up timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('execute', () => {
    it('should handle /claw command and format output correctly', async () => {
      const mockMessage: Message = {
        id: 'msg1',
        content: '/claw',
        sender: 'user1',
        chatId: 'chat123',
        gateway: 'telegram',
        timestamp: Date.now()
      };

      await clawSkill.execute(mockMessage, [], mockAgentContext);

      // Verify the crypto/meme functions were called
      expect(cryptoUtils.generateRandomKey).toHaveBeenCalled();
      expect(memeUtils.getRandomMeme).toHaveBeenCalledWith(memeUtils.FAILURE_MEMES);

      // Verify sendMessage was called
      expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);

      // Check the exact arguments passed to sendMessage
      const [gateway, chatId, responseText] = mockAgentContext.sendMessage.mock.calls[0];

      expect(gateway).toBe('telegram');
      expect(chatId).toBe('chat123');

      // Verify the formatted string contains all required elements
      expect(responseText).toContain('🦞 *CLAW ATTEMPT #1000* 🦞');
      expect(responseText).toContain('🔑 Private Key: ||12345678...[REDACTED]||');
      expect(responseText).toContain('TBTC Address: `1MockAddressForTestingOnly`');
      expect(responseText).toContain('❌ MATCH: FALSE (Not Satoshi)');
      expect(responseText).toContain('💬 MOCK_MEME_TEXT');
      expect(responseText).toContain('⚠️ _This is a simulation. Do not use generated keys._');
    });

    it('should handle /mine command identically to /claw', async () => {
      const mockMessage: Message = {
        id: 'msg2',
        content: '/mine',
        sender: 'user1',
        chatId: 'chat123',
        gateway: 'whatsapp',
        timestamp: Date.now()
      };

      await clawSkill.execute(mockMessage, [], mockAgentContext);

      expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);
      const responseText = mockAgentContext.sendMessage.mock.calls[0][2];

      expect(responseText).toContain('🦞 *CLAW ATTEMPT #1000* 🦞');
      expect(responseText).toContain('🔑 Private Key: ||12345678...[REDACTED]||');
      expect(responseText).toContain('TBTC Address: `1MockAddressForTestingOnly`');
      expect(responseText).toContain('💬 MOCK_MEME_TEXT');
    });

    it('should handle /status command', async () => {
      const mockMessage: Message = {
        id: 'msg3',
        content: '/status',
        sender: 'user1',
        chatId: 'chat123',
        gateway: 'telegram',
        timestamp: Date.now()
      };

      // Mock getProbabilityOfFindingSatoshi
      const mockProb = cryptoUtils.getProbabilityOfFindingSatoshi as jest.Mock;
      mockProb.mockReturnValue("1 in a lot");

      await clawSkill.execute(mockMessage, [], mockAgentContext);

      expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);
      const responseText = mockAgentContext.sendMessage.mock.calls[0][2];

      expect(responseText).toContain('📊 *SATHOSHICLAW STATUS* 📊');
      expect(responseText).toContain('🦞 Total Claws: 1,000');
      expect(responseText).toContain('💀 Keys Found: 0');
      expect(responseText).toContain('🏆 Satoshi Found: NO');
      expect(responseText).toContain('💬 MOCK_MEME_TEXT');
      expect(responseText).toContain('probability: 1 in 2^256');
    });
  });
});
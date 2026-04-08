import { StatsTrackerSkill } from '../StatsTrackerSkill';
import { Message, AgentContext } from '../../core/types';
import os from 'os';

// Mock the OS module
jest.mock('os');

describe('StatsTrackerSkill', () => {
    let skill: StatsTrackerSkill;
    let mockAgentContext: jest.Mocked<AgentContext>;
    let mockMessage: Message;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Instantiate the skill
        skill = new StatsTrackerSkill();

        // Create a mocked AgentContext
        mockAgentContext = {
            sendMessage: jest.fn(),
            broadcast: jest.fn(),
            logger: {
                info: jest.fn(),
                error: jest.fn(),
                warn: jest.fn(),
            },
            config: {}
        } as unknown as jest.Mocked<AgentContext>;

        // Create a mocked message
        mockMessage = {
            id: '123',
            content: '/stats',
            sender: 'user1',
            chatId: 'chat123',
            gateway: 'telegram',
            timestamp: 1234567890
        };

        // Setup process.memoryUsage mock
        jest.spyOn(process, 'memoryUsage').mockReturnValue({
            rss: 50 * 1024 * 1024, // 50 MB
            heapTotal: 20 * 1024 * 1024,
            heapUsed: 10 * 1024 * 1024,
            external: 1 * 1024 * 1024,
            arrayBuffers: 1 * 1024 * 1024
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should format and send stats correctly', async () => {
        // Mock specific OS functions
        (os.uptime as jest.Mock).mockReturnValue(7200); // 2 hours
        (os.loadavg as jest.Mock).mockReturnValue([1.5, 1.0, 0.5]);
        (os.platform as jest.Mock).mockReturnValue('linux');
        (os.arch as jest.Mock).mockReturnValue('x64');

        await skill.execute(mockMessage, [], mockAgentContext);

        // Verify sendMessage was called
        expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);

        // Check the arguments passed to sendMessage
        const [gateway, chatId, response] = mockAgentContext.sendMessage.mock.calls[0];

        expect(gateway).toBe('telegram');
        expect(chatId).toBe('chat123');

        // Check if response contains expected formatted strings
        expect(response).toContain('🖥 *SYSTEM STATUS* 🖥');
        expect(response).toContain('⏱ Uptime: 2.00 hours');
        expect(response).toContain('🧠 Memory: 50.00 MB');
        expect(response).toContain('⚡ Load Average: 1.50');
        expect(response).toContain('🦞 SathoshiClaw is running on linux (x64)');
    });
});

import { MemeGeneratorSkill } from './MemeGeneratorSkill';
import { Message, AgentContext } from '../core/types';
import * as memesModule from '../utils/memes';

// Mock the memes module to control the randomness in tests
jest.mock('../utils/memes', () => {
    const originalModule = jest.requireActual('../utils/memes');
    return {
        ...originalModule,
        getRandomMeme: jest.fn(),
    };
});

describe('MemeGeneratorSkill', () => {
    let skill: MemeGeneratorSkill;
    let mockAgentContext: AgentContext;

    beforeEach(() => {
        skill = new MemeGeneratorSkill();

        mockAgentContext = {
            sendMessage: jest.fn().mockResolvedValue(undefined),
            broadcast: jest.fn().mockResolvedValue(undefined),
            logger: {},
            config: {},
        } as unknown as AgentContext;

        // Reset mock implementations between tests
        jest.clearAllMocks();
    });

    it('should generate a meme and send it back to the same chat', async () => {
        const mockMeme = 'This is a test meme.';
        (memesModule.getRandomMeme as jest.Mock).mockReturnValue(mockMeme);

        const mockMessage: Message = {
            id: '123',
            content: '/meme',
            sender: 'user1',
            chatId: 'chat456',
            gateway: 'telegram',
            timestamp: Date.now(),
        };

        await skill.execute(mockMessage, [], mockAgentContext);

        // Verify getRandomMeme was called
        expect(memesModule.getRandomMeme).toHaveBeenCalledTimes(1);

        // It should use the exported arrays and custom templates,
        // we can just assert it was called with an array containing the defaults.
        // We won't test the exact array contents here as it's defined inside the module,
        // but we can verify our mock worked and agent.sendMessage was called.

        expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);
        expect(mockAgentContext.sendMessage).toHaveBeenCalledWith(
            'telegram',
            'chat456',
            `🦞 ${mockMeme}`
        );
    });

    it('should handle /joke trigger the same way', async () => {
        const mockMeme = 'Another funny joke.';
        (memesModule.getRandomMeme as jest.Mock).mockReturnValue(mockMeme);

        const mockMessage: Message = {
            id: '124',
            content: '/joke',
            sender: 'user2',
            chatId: 'chat789',
            gateway: 'whatsapp',
            timestamp: Date.now(),
        };

        await skill.execute(mockMessage, [], mockAgentContext);

        expect(mockAgentContext.sendMessage).toHaveBeenCalledTimes(1);
        expect(mockAgentContext.sendMessage).toHaveBeenCalledWith(
            'whatsapp',
            'chat789',
            `🦞 ${mockMeme}`
        );
    });
});

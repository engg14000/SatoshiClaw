import { MemeGeneratorSkill } from './MemeGeneratorSkill';
import { Message, AgentContext } from '../core/types';
import * as memesModule from '../utils/memes';

// Mock the memes utility module
jest.mock('../utils/memes', () => {
    const originalModule = jest.requireActual('../utils/memes');
    return {
        ...originalModule,
        getRandomMeme: jest.fn(),
    };
});

describe('MemeGeneratorSkill', () => {
    let skill: MemeGeneratorSkill;
    let mockAgent: jest.Mocked<AgentContext>;
    let mockMessage: Message;

    beforeEach(() => {
        skill = new MemeGeneratorSkill();

        mockAgent = {
            sendMessage: jest.fn(),
            broadcast: jest.fn(),
            logger: { info: jest.fn(), error: jest.fn() },
            config: {}
        } as unknown as jest.Mocked<AgentContext>;

        mockMessage = {
            id: 'msg-1',
            content: '/meme',
            sender: 'user1',
            chatId: 'chat-1',
            gateway: 'telegram',
            timestamp: Date.now()
        };

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should have the correct name, description, and triggers', () => {
        expect(skill.name).toBe('MemeGeneratorSkill');
        expect(skill.description).toBe('Generates high-quality crypto memes.');
        expect(skill.triggers).toEqual(['/meme', '/joke']);
    });

    it('should generate a meme and send it via the agent', async () => {
        const mockedMeme = "This is a mock meme.";
        (memesModule.getRandomMeme as jest.Mock).mockReturnValue(mockedMeme);

        await skill.execute(mockMessage, [], mockAgent);

        // Verify getRandomMeme was called
        expect(memesModule.getRandomMeme).toHaveBeenCalledTimes(1);

        // Ensure that agent.sendMessage routes the meme to the correct gateway with "🦞" prefix
        expect(mockAgent.sendMessage).toHaveBeenCalledTimes(1);
        expect(mockAgent.sendMessage).toHaveBeenCalledWith(
            mockMessage.gateway,
            mockMessage.chatId,
            `🦞 ${mockedMeme}`
        );
    });

    it('should handle different gateways in message properly', async () => {
        const mockWhatsappMessage: Message = { ...mockMessage, gateway: 'whatsapp' };
        const mockedMeme = "Whatsapp meme test.";
        (memesModule.getRandomMeme as jest.Mock).mockReturnValue(mockedMeme);

        await skill.execute(mockWhatsappMessage, [], mockAgent);

        expect(mockAgent.sendMessage).toHaveBeenCalledWith(
            'whatsapp',
            mockMessage.chatId,
            `🦞 ${mockedMeme}`
        );
    });
});

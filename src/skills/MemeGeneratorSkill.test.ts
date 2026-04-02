import { MemeGeneratorSkill } from './MemeGeneratorSkill';
import { Message, AgentContext } from '../core/types';
import { FAILURE_MEMES, STATUS_MEMES } from '../utils/memes';

describe('MemeGeneratorSkill', () => {
    let skill: MemeGeneratorSkill;
    let mockAgent: jest.Mocked<AgentContext>;
    let mockMessage: Message;

    const ALL_MEMES = [
        ...FAILURE_MEMES,
        ...STATUS_MEMES,
        "Bitcoin fixes this.",
        "Have fun staying poor.",
        "Not your keys, not your coins.",
        "Wen Lambo?",
        "To the moon! 🚀",
        "Buy high, sell low.",
        "1 BTC = 1 BTC",
        "Long Bitcoin, Short the Banks."
    ];

    beforeEach(() => {
        skill = new MemeGeneratorSkill();

        mockAgent = {
            sendMessage: jest.fn().mockResolvedValue(undefined),
            broadcast: jest.fn().mockResolvedValue(undefined),
            logger: {
                info: jest.fn(),
                error: jest.fn(),
                warn: jest.fn(),
                debug: jest.fn()
            },
            config: {}
        } as unknown as jest.Mocked<AgentContext>;

        mockMessage = {
            id: 'test-msg-id',
            content: '/meme',
            sender: 'test-user',
            chatId: 'test-chat-id',
            gateway: 'telegram',
            timestamp: Date.now()
        };
    });

    it('should have the correct name, description, and triggers', () => {
        expect(skill.name).toBe('MemeGeneratorSkill');
        expect(skill.description).toBe('Generates high-quality crypto memes.');
        expect(skill.triggers).toEqual(['/meme', '/joke']);
    });

    it('should reply with a random meme formatted correctly on execute', async () => {
        await skill.execute(mockMessage, [], mockAgent);

        expect(mockAgent.sendMessage).toHaveBeenCalledTimes(1);

        // Ensure it is called with the correct gateway and chat ID
        const [gateway, chatId, content] = mockAgent.sendMessage.mock.calls[0];
        expect(gateway).toBe('telegram');
        expect(chatId).toBe('test-chat-id');

        // Ensure the content starts with the lobster emoji and contains one of the templates
        expect(content.startsWith('🦞 ')).toBe(true);
        const memeText = content.substring(3); // Remove the emoji and space

        expect(ALL_MEMES).toContain(memeText);
    });
});

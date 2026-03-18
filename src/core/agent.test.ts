import { SathoshiClawAgent } from './agent';
import { Gateway, Skill, Message, AgentConfig, AgentContext } from './types';

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;
    let mockGateway: jest.Mocked<Gateway>;
    let mockSkill: jest.Mocked<Skill>;
    let messageCallback: (msg: Message) => Promise<void>;

    beforeEach(() => {
        // Reset everything before each test
        const config: AgentConfig = {
            whatsappEnabled: false,
            heartbeatInterval: 1,
            memeIntensity: 5,
        };
        agent = new SathoshiClawAgent(config);

        // Create a Mock Gateway
        mockGateway = {
            name: 'mockGateway',
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            sendMessage: jest.fn().mockResolvedValue(undefined),
            onMessage: jest.fn((cb) => {
                messageCallback = cb as unknown as (msg: Message) => Promise<void>;
            }),
        };

        // Create a Mock Skill
        mockSkill = {
            name: 'mockSkill',
            description: 'A mock skill',
            triggers: ['!mine', '!dig'],
            execute: jest.fn().mockResolvedValue(undefined),
        };

        // Register them
        agent.registerGateway(mockGateway);
        agent.registerSkill(mockSkill);
    });

    it('should handle missing skill triggers gracefully', async () => {
        // Verify that the callback was registered
        expect(messageCallback).toBeDefined();

        // Create a message that doesn't trigger any skill
        const unknownMessage: Message = {
            id: 'msg1',
            gateway: 'mockGateway',
            chatId: '12345',
            sender: 'user1',
            content: '!unknown_command param1',
            timestamp: Date.now()
        };

        // Simulate receiving the message
        // handleMessage is a private method, but we trigger it through the gateway's onMessage callback
        await expect(messageCallback(unknownMessage)).resolves.not.toThrow();

        // Assert the mock skill was never executed
        expect(mockSkill.execute).not.toHaveBeenCalled();

        // Optional: Also check a valid trigger to ensure the mock is working properly
        const validMessage: Message = {
            id: 'msg2',
            gateway: 'mockGateway',
            chatId: '12345',
            sender: 'user1',
            content: '!mine param1',
            timestamp: Date.now()
        };
        await messageCallback(validMessage);
        expect(mockSkill.execute).toHaveBeenCalledTimes(1);
    });
});

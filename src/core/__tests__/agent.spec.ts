import { SathoshiClawAgent } from '../agent';
import { Gateway, Skill, Message, AgentContext, AgentConfig } from '../types';

describe('SathoshiClawAgent Error Handling', () => {
    let agent: SathoshiClawAgent;
    let mockGateway: jest.Mocked<Gateway>;
    let mockSkill: jest.Mocked<Skill>;
    let messageHandler: (message: Message) => void;

    beforeEach(() => {
        // 1. Setup Mock Config
        const config: AgentConfig = {
            whatsappEnabled: false,
            heartbeatInterval: 60,
            memeIntensity: 10
        };

        // 2. Initialize Agent
        agent = new SathoshiClawAgent(config);

        // 3. Setup Mock Gateway
        mockGateway = {
            name: 'mock-gateway',
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            sendMessage: jest.fn().mockResolvedValue(undefined),
            onMessage: jest.fn().mockImplementation((handler) => {
                messageHandler = handler;
            }),
        };

        // 4. Setup Mock Skill that throws an error
        mockSkill = {
            name: 'ErrorThrowingSkill',
            description: 'A skill that predictably throws an error for testing.',
            triggers: ['/error'],
            execute: jest.fn().mockRejectedValue(new Error('Simulated skill execution error!')),
            onHeartbeat: jest.fn().mockResolvedValue(undefined),
        };

        // 5. Register Gateway and Skill
        agent.registerGateway(mockGateway);
        agent.registerSkill(mockSkill);
    });

    afterEach(async () => {
        await agent.stop();
        jest.clearAllMocks();
    });

    it('should catch errors thrown by a skill and send an error message', async () => {
        // 1. Ensure the handler was captured during registerGateway
        expect(messageHandler).toBeDefined();

        // 2. Create a message that triggers the mock skill
        const testMessage: Message = {
            id: 'msg-1',
            content: '/error some arguments',
            sender: 'user1',
            chatId: 'chat-123',
            gateway: 'mock-gateway',
            timestamp: Date.now(),
        };

        // 3. Trigger the message handler
        // The handler is async, so we await it to ensure it completes before asserting
        await messageHandler(testMessage);

        // 4. Assertions

        // Verify the skill was actually called
        expect(mockSkill.execute).toHaveBeenCalledTimes(1);
        expect(mockSkill.execute).toHaveBeenCalledWith(
            testMessage,
            ['some', 'arguments'],
            expect.anything() // Context
        );

        // Verify that the error message was sent via the gateway
        expect(mockGateway.sendMessage).toHaveBeenCalledTimes(1);
        expect(mockGateway.sendMessage).toHaveBeenCalledWith(
            'chat-123',
            '💥 The claw jammed! (Error executing skill)'
        );
    });
});

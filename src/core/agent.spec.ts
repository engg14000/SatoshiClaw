import { SathoshiClawAgent } from './agent';
import { Gateway, Message, AgentConfig } from './types';

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;
    let mockGateway: jest.Mocked<Gateway>;

    beforeEach(() => {
        const config: AgentConfig = {
            whatsappEnabled: false,
            heartbeatInterval: 60,
            memeIntensity: 10
        };
        agent = new SathoshiClawAgent(config);

        mockGateway = {
            name: 'mock-gateway',
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            sendMessage: jest.fn().mockResolvedValue(undefined),
            onMessage: jest.fn()
        };
    });

    describe('registerGateway', () => {
        it('should add the gateway to internal map', () => {
            agent.registerGateway(mockGateway);

            // Access private field using type assertion to verify it was added
            const gateways = (agent as any).gateways as Map<string, Gateway>;
            expect(gateways.has('mock-gateway')).toBe(true);
            expect(gateways.get('mock-gateway')).toBe(mockGateway);
        });

        it('should attach an onMessage handler', () => {
            agent.registerGateway(mockGateway);

            // Verify onMessage was called during registration
            expect(mockGateway.onMessage).toHaveBeenCalled();
            expect(mockGateway.onMessage).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should correctly handle messages via the attached handler', async () => {
            agent.registerGateway(mockGateway);

            // Get the handler that was passed to onMessage
            const onMessageHandler = mockGateway.onMessage.mock.calls[0][0];

            // Mock handleMessage on the agent to observe if it's called
            const handleMessageSpy = jest.spyOn(agent as any, 'handleMessage').mockImplementation();

            const mockMessage: Message = {
                id: '1',
                content: '/claw',
                sender: 'user1',
                chatId: 'chat1',
                gateway: 'mock-gateway',
                timestamp: Date.now()
            };

            // Invoke the handler
            onMessageHandler(mockMessage);

            // Verify handleMessage was called with the message
            expect(handleMessageSpy).toHaveBeenCalledWith(mockMessage);
        });
    });
});

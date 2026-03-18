import { SathoshiClawAgent } from './agent';
import { Gateway, Message, AgentConfig } from './types';

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;
    let mockConfig: AgentConfig;

    beforeEach(() => {
        mockConfig = {
            whatsappEnabled: false,
            heartbeatInterval: 60,
            memeIntensity: 5
        };
        agent = new SathoshiClawAgent(mockConfig);
    });

    describe('registerGateway', () => {
        it('should add the gateway to the internal gateways map', () => {
            const mockGateway: Gateway = {
                name: 'test-gateway',
                start: jest.fn(),
                stop: jest.fn(),
                sendMessage: jest.fn(),
                onMessage: jest.fn()
            };

            agent.registerGateway(mockGateway);

            // Access private field via 'any' to verify state
            const gateways = (agent as any).gateways as Map<string, Gateway>;
            expect(gateways.has('test-gateway')).toBe(true);
            expect(gateways.get('test-gateway')).toBe(mockGateway);
        });

        it('should register an onMessage handler with the gateway', () => {
            let registeredHandler: ((msg: Message) => void) | undefined;
            const mockGateway: Gateway = {
                name: 'test-gateway',
                start: jest.fn(),
                stop: jest.fn(),
                sendMessage: jest.fn(),
                onMessage: jest.fn().mockImplementation((handler) => {
                    registeredHandler = handler;
                })
            };

            // Spy on the private handleMessage method
            const handleMessageSpy = jest.spyOn(agent as any, 'handleMessage').mockImplementation();

            agent.registerGateway(mockGateway);

            // Verify that onMessage was called with a function
            expect(mockGateway.onMessage).toHaveBeenCalled();
            expect(typeof registeredHandler).toBe('function');

            // Simulate the gateway receiving a message
            const mockMessage: Message = {
                id: '1',
                content: 'test',
                sender: 'user',
                chatId: 'chat',
                gateway: 'test-gateway',
                timestamp: Date.now()
            };

            // Trigger the handler
            if (registeredHandler) {
                registeredHandler(mockMessage);
            }

            // Verify that the agent's internal handleMessage method was called with the message
            expect(handleMessageSpy).toHaveBeenCalledWith(mockMessage);

            handleMessageSpy.mockRestore();
        });
    });
});

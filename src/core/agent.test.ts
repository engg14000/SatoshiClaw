import { SathoshiClawAgent } from './agent';
import { Gateway, AgentConfig } from './types';
import { logger } from '../utils/logger';

// Mock node-schedule to prevent actual scheduling
jest.mock('node-schedule', () => ({
    scheduleJob: jest.fn(),
    gracefulShutdown: jest.fn(),
}));

// Mock logger to avoid spamming the console during tests
jest.mock('../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    }
}));

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;
    let config: AgentConfig;

    beforeEach(() => {
        config = {
            whatsappEnabled: false,
            heartbeatInterval: 60,
            memeIntensity: 10,
        };
        agent = new SathoshiClawAgent(config);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('start()', () => {
        it('handles gateway start errors and continues starting other gateways', async () => {
            // Create mock gateways
            const mockGateway1Start = jest.fn().mockResolvedValue(undefined);
            const gateway1: Gateway = {
                name: 'Gateway1',
                start: mockGateway1Start,
                stop: jest.fn().mockResolvedValue(undefined),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn(),
            };

            const mockGateway2Start = jest.fn().mockRejectedValue(new Error('Failed to start Gateway2'));
            const gateway2: Gateway = {
                name: 'Gateway2',
                start: mockGateway2Start,
                stop: jest.fn().mockResolvedValue(undefined),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn(),
            };

            const mockGateway3Start = jest.fn().mockResolvedValue(undefined);
            const gateway3: Gateway = {
                name: 'Gateway3',
                start: mockGateway3Start,
                stop: jest.fn().mockResolvedValue(undefined),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn(),
            };

            // Register all gateways
            agent.registerGateway(gateway1);
            agent.registerGateway(gateway2);
            agent.registerGateway(gateway3);

            // Spy on logger.error to verify the error was caught and logged
            // Start the agent - should not throw
            await expect(agent.start()).resolves.not.toThrow();

            // Verify all gateways attempted to start
            expect(mockGateway1Start).toHaveBeenCalledTimes(1);
            expect(mockGateway2Start).toHaveBeenCalledTimes(1);
            expect(mockGateway3Start).toHaveBeenCalledTimes(1);

            // Verify the error was logged
            expect(logger.error).toHaveBeenCalledWith(
                'Failed to start gateway Gateway2:',
                expect.any(Error)
            );

            // Verify Gateway 3 still started despite Gateway 2 failing
            expect(logger.info).toHaveBeenCalledWith('Started gateway: Gateway3');
        });
    });
});

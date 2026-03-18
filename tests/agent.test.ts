import { SathoshiClawAgent } from '../src/core/agent';
import { AgentConfig, Gateway } from '../src/core/types';
import schedule from 'node-schedule';
import { logger } from '../src/utils/logger';

// Mock the node-schedule to prevent actual scheduling and allow verification
jest.mock('node-schedule', () => ({
    scheduleJob: jest.fn(),
    gracefulShutdown: jest.fn()
}));

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;
    let mockConfig: AgentConfig;

    beforeEach(() => {
        // Suppress logger output during tests to keep console clean
        jest.spyOn(logger, 'info').mockImplementation(() => logger);
        jest.spyOn(logger, 'error').mockImplementation(() => logger);

        mockConfig = {
            whatsappEnabled: false,
            heartbeatInterval: 60,
            memeIntensity: 5
        };
        agent = new SathoshiClawAgent(mockConfig);

        // Clear mock calls between tests
        (schedule.gracefulShutdown as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('stop()', () => {
        it('should gracefully stop all registered gateways', async () => {
            // Create mock gateways
            const mockGateway1: Gateway = {
                name: 'gateway1',
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn()
            };

            const mockGateway2: Gateway = {
                name: 'gateway2',
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn()
            };

            // Register gateways
            agent.registerGateway(mockGateway1);
            agent.registerGateway(mockGateway2);

            // Call stop
            await agent.stop();

            // Verify both gateways were stopped
            expect(mockGateway1.stop).toHaveBeenCalledTimes(1);
            expect(mockGateway2.stop).toHaveBeenCalledTimes(1);

            // Verify graceful shutdown was called
            expect(schedule.gracefulShutdown).toHaveBeenCalledTimes(1);
        });

        it('should handle stopping when no gateways are registered', async () => {
            await agent.stop();
            expect(schedule.gracefulShutdown).toHaveBeenCalledTimes(1);
        });

        it('should continue stopping other gateways even if one fails and complete graceful shutdown', async () => {
            const mockGateway1: Gateway = {
                name: 'gateway1',
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockRejectedValue(new Error('Stop failed')),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn()
            };

            const mockGateway2: Gateway = {
                name: 'gateway2',
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                sendMessage: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn()
            };

            agent.registerGateway(mockGateway1);
            agent.registerGateway(mockGateway2);

            await agent.stop();

            // Gateway 1 stop was called and failed
            expect(mockGateway1.stop).toHaveBeenCalledTimes(1);
            // Error was logged
            expect(logger.error).toHaveBeenCalledWith(
                `Failed to stop gateway gateway1:`,
                expect.any(Error)
            );

            // Gateway 2 should STILL be stopped despite gateway1 failure
            expect(mockGateway2.stop).toHaveBeenCalledTimes(1);
            // Graceful shutdown should still be called
            expect(schedule.gracefulShutdown).toHaveBeenCalledTimes(1);
        });
    });
});

import { SathoshiClawAgent } from '../../src/core/agent';
import { Gateway, AgentConfig } from '../../src/core/types';
import { logger } from '../../src/utils/logger';

// Mock logger to avoid console spam during tests
jest.mock('../../src/utils/logger', () => ({
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
            memeIntensity: 5
        };
        agent = new SathoshiClawAgent(config);
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await agent.stop();
    });

    describe('start()', () => {
        it('should handle gateway start errors and continue starting other gateways', async () => {
            // Arrange
            const successfulGateway: Gateway = {
                name: 'Gateway1',
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn(),
                sendMessage: jest.fn().mockResolvedValue(undefined),
            };

            const failingGateway: Gateway = {
                name: 'Gateway2',
                start: jest.fn().mockRejectedValue(new Error('Failed to start Gateway2')),
                stop: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn(),
                sendMessage: jest.fn().mockResolvedValue(undefined),
            };

            const successfulGateway2: Gateway = {
                name: 'Gateway3',
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                onMessage: jest.fn(),
                sendMessage: jest.fn().mockResolvedValue(undefined),
            };

            agent.registerGateway(successfulGateway);
            agent.registerGateway(failingGateway);
            agent.registerGateway(successfulGateway2);

            // Act
            await agent.start();

            // Assert
            expect(successfulGateway.start).toHaveBeenCalled();
            expect(failingGateway.start).toHaveBeenCalled();
            expect(successfulGateway2.start).toHaveBeenCalled();

            expect(logger.info).toHaveBeenCalledWith('Started gateway: Gateway1');
            expect(logger.error).toHaveBeenCalledWith('Failed to start gateway Gateway2:', expect.any(Error));
            expect(logger.info).toHaveBeenCalledWith('Started gateway: Gateway3');
        });
    });
});

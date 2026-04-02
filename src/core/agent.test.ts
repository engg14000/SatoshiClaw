import { SathoshiClawAgent } from './agent';
import { Gateway, AgentConfig } from './types';
import schedule from 'node-schedule';

jest.mock('node-schedule', () => ({
  gracefulShutdown: jest.fn(),
  scheduleJob: jest.fn(),
}));

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;
    let mockGateway1: jest.Mocked<Gateway>;
    let mockGateway2: jest.Mocked<Gateway>;
    const mockConfig: AgentConfig = {
        heartbeatInterval: 60,
        whatsappEnabled: false,
        memeIntensity: 5
    };

    beforeEach(() => {
        jest.clearAllMocks();

        agent = new SathoshiClawAgent(mockConfig);

        mockGateway1 = {
            name: 'gateway1',
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            sendMessage: jest.fn().mockResolvedValue(undefined),
            onMessage: jest.fn(),
        };

        mockGateway2 = {
            name: 'gateway2',
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            sendMessage: jest.fn().mockResolvedValue(undefined),
            onMessage: jest.fn(),
        };
    });

    describe('stop', () => {
        it('gracefully stops gateways and schedules shutdown', async () => {
            // Register gateways
            agent.registerGateway(mockGateway1);
            agent.registerGateway(mockGateway2);

            // Call stop
            await agent.stop();

            // Verify each gateway stop method was called exactly once
            expect(mockGateway1.stop).toHaveBeenCalledTimes(1);
            expect(mockGateway2.stop).toHaveBeenCalledTimes(1);

            // Verify node-schedule.gracefulShutdown was called
            expect(schedule.gracefulShutdown).toHaveBeenCalledTimes(1);
        });

        it('handles case with no gateways gracefully', async () => {
            // Call stop without registering gateways
            await agent.stop();

            // Verify node-schedule.gracefulShutdown was called
            expect(schedule.gracefulShutdown).toHaveBeenCalledTimes(1);
        });
    });
});

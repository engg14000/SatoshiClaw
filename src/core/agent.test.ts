import schedule from 'node-schedule';
import { SathoshiClawAgent } from './agent';
import { AgentConfig, Skill, Gateway } from './types';

// Mock node-schedule
jest.mock('node-schedule', () => ({
    scheduleJob: jest.fn(),
    gracefulShutdown: jest.fn(),
}));

describe('SathoshiClawAgent', () => {
    let agent: SathoshiClawAgent;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('start() - Heartbeat Scheduling', () => {
        it('should schedule heartbeat with default interval (60 minutes) when config.heartbeatInterval is undefined', async () => {
            const config = {
                whatsappEnabled: false,
                memeIntensity: 5
            } as AgentConfig;

            agent = new SathoshiClawAgent(config);

            await agent.start();

            expect(schedule.scheduleJob).toHaveBeenCalledWith('*/60 * * * *', expect.any(Function));
        });

        it('should schedule heartbeat with custom interval when config.heartbeatInterval is provided', async () => {
            const config = {
                whatsappEnabled: false,
                heartbeatInterval: 30,
                memeIntensity: 5
            } as AgentConfig;

            agent = new SathoshiClawAgent(config);

            await agent.start();

            expect(schedule.scheduleJob).toHaveBeenCalledWith('*/30 * * * *', expect.any(Function));
        });

        it('should run heartbeat once on startup immediately', async () => {
            const config = {
                whatsappEnabled: false,
                heartbeatInterval: 15,
                memeIntensity: 5
            } as AgentConfig;

            agent = new SathoshiClawAgent(config);

            // Create a mock skill to observe heartbeat calls
            const mockSkill: Skill = {
                name: 'mock-skill',
                description: 'test',
                triggers: [],
                execute: jest.fn(),
                onHeartbeat: jest.fn(),
            };

            agent.registerSkill(mockSkill);

            await agent.start();

            // Verify onHeartbeat was called once immediately on startup
            expect(mockSkill.onHeartbeat).toHaveBeenCalledTimes(1);
        });

        it('scheduled callback should trigger heartbeat', async () => {
             const config = {
                whatsappEnabled: false,
                heartbeatInterval: 10,
                memeIntensity: 5
            } as AgentConfig;

            agent = new SathoshiClawAgent(config);

            // Create a mock skill to observe heartbeat calls
            const mockSkill: Skill = {
                name: 'mock-skill',
                description: 'test',
                triggers: [],
                execute: jest.fn(),
                onHeartbeat: jest.fn(),
            };

            agent.registerSkill(mockSkill);

            await agent.start();

            // At this point it's called once immediately
            expect(mockSkill.onHeartbeat).toHaveBeenCalledTimes(1);

            // Get the scheduled callback and invoke it
            const scheduleJobCall = (schedule.scheduleJob as jest.Mock).mock.calls[0];
            const callback = scheduleJobCall[1];

            // Trigger the callback explicitly
            callback();

            // The skill should now have been triggered twice (1x startup + 1x interval)
            expect(mockSkill.onHeartbeat).toHaveBeenCalledTimes(2);
        });
    });
});

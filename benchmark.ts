import { SathoshiClawAgent } from './src/core/agent';
import { AgentConfig, Skill, Message, AgentContext } from './src/core/types';

const config: AgentConfig = {
    whatsappEnabled: false,
    heartbeatInterval: 1,
    memeIntensity: 1
};

const agent = new SathoshiClawAgent(config);

const slowSkill1: Skill = {
    name: 'SlowSkill1',
    description: 'Slow',
    triggers: [],
    execute: async () => {},
    onHeartbeat: async () => {
        return new Promise(resolve => setTimeout(resolve, 100));
    }
};

const slowSkill2: Skill = {
    name: 'SlowSkill2',
    description: 'Slow',
    triggers: [],
    execute: async () => {},
    onHeartbeat: async () => {
        return new Promise(resolve => setTimeout(resolve, 150));
    }
};

agent.registerSkill(slowSkill1);
agent.registerSkill(slowSkill2);

async function run() {
    const start = Date.now();
    await (agent as any).triggerHeartbeat();
    const end = Date.now();
    console.log(`Execution time: ${end - start}ms`);
}

run();

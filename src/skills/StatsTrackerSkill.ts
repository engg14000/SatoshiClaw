import { BaseSkill } from '../core/skill';
import { Message, AgentContext } from '../core/types';

export class StatsTrackerSkill extends BaseSkill {
    name = 'StatsTrackerSkill';
    description = 'Tracks bot performance and uptime.';
    triggers = ['/stats', '/system'];

    async execute(message: Message, args: string[], agent: AgentContext): Promise<void> {
        const uptime = process.uptime();
        const memory = process.memoryUsage();

        const response = `
🖥 *BOT STATUS* 🖥
--------------------------------
⏱ Uptime: ${(uptime / 3600).toFixed(2)} hours
🧠 Memory: ${(memory.rss / 1024 / 1024).toFixed(2)} MB
--------------------------------
🦞 SathoshiClaw is running
`;
        await agent.sendMessage(message.gateway, message.chatId, response);
    }
}

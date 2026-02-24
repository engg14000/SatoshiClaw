import { BaseSkill } from '../core/skill';
import { Message, AgentContext } from '../core/types';
import os from 'os';

export class StatsTrackerSkill extends BaseSkill {
    name = 'StatsTrackerSkill';
    description = 'Tracks system performance and uptime.';
    triggers = ['/stats', '/system'];

    async execute(message: Message, args: string[], agent: AgentContext): Promise<void> {
        const uptime = os.uptime();
        const load = os.loadavg();
        const memory = process.memoryUsage();

        const response = `
🖥 *SYSTEM STATUS* 🖥
--------------------------------
⏱ Uptime: ${(uptime / 3600).toFixed(2)} hours
🧠 Memory: ${(memory.rss / 1024 / 1024).toFixed(2)} MB
⚡ Load Average: ${load[0].toFixed(2)}
--------------------------------
🦞 SathoshiClaw is running on ${os.platform()} (${os.arch()})
`;
        await agent.sendMessage(message.gateway, message.chatId, response);
    }
}

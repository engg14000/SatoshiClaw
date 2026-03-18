import schedule from 'node-schedule';
import { Gateway, Skill, Message, AgentContext, AgentConfig } from './types';
import { logger } from '../utils/logger';

export class SathoshiClawAgent {
    private gateways: Map<string, Gateway> = new Map();
    private skills: Map<string, Skill> = new Map();
    private config: AgentConfig;
    private context: AgentContext;
    private rateLimits: Map<string, number> = new Map();

    constructor(config: AgentConfig) {
        this.config = config;
        this.context = {
            sendMessage: this.sendMessage.bind(this),
            broadcast: this.broadcast.bind(this),
            logger: logger,
            config: this.config
        };
    }

    public registerGateway(gateway: Gateway) {
        this.gateways.set(gateway.name, gateway);
        gateway.onMessage((msg) => this.handleMessage(msg));
        logger.info(`Gateway registered: ${gateway.name}`);
    }

    public registerSkill(skill: Skill) {
        this.skills.set(skill.name, skill);
        logger.info(`Skill registered: ${skill.name} [${skill.triggers.join(', ')}]`);
    }

    public async start() {
        logger.info('Starting SathoshiClaw Agent...');

        // Start all gateways
        for (const gateway of this.gateways.values()) {
            try {
                await gateway.start();
                logger.info(`Started gateway: ${gateway.name}`);
            } catch (error) {
                logger.error(`Failed to start gateway ${gateway.name}:`, error);
            }
        }

        // Schedule Heartbeat
        const interval = this.config.heartbeatInterval || 60;
        logger.info(`Scheduling heartbeat every ${interval} minutes.`);
        schedule.scheduleJob(`*/${interval} * * * *`, () => this.triggerHeartbeat());

        logger.info('SathoshiClaw is live and clawing!');
        this.triggerHeartbeat(); // Run once on startup
    }

    public async stop() {
        logger.info('Stopping SathoshiClaw Agent...');
        for (const gateway of this.gateways.values()) {
            await gateway.stop();
        }
        schedule.gracefulShutdown();
    }

    private async handleMessage(message: Message) {
        logger.debug(`Received message from ${message.gateway}: ${message.content}`);

        const args = message.content.split(' ');
        const command = args[0].toLowerCase();

        let handled = false;
        let matchedSkill: Skill | undefined;

        for (const skill of this.skills.values()) {
            if (skill.triggers.includes(command)) {
                matchedSkill = skill;
                break;
            }
        }

        if (matchedSkill) {
            const rateLimitKey = `${message.gateway}:${message.chatId}`;
            const now = Date.now();
            const lastExecutionTime = this.rateLimits.get(rateLimitKey) || 0;
            const rateLimitMs = this.config.rateLimitMs ?? 3000;

            if (now - lastExecutionTime < rateLimitMs) {
                logger.warn(`Rate limit exceeded for ${rateLimitKey} on command ${command}`);
                await this.sendMessage(message.gateway, message.chatId, "⏳ Whoa there! The claw is cooling down. Please wait a moment.");
                handled = true;
            } else {
                this.rateLimits.set(rateLimitKey, now);
                logger.info(`Executing skill ${matchedSkill.name} for command ${command}`);
                try {
                    await matchedSkill.execute(message, args.slice(1), this.context);
                } catch (error) {
                    logger.error(`Error executing skill ${matchedSkill.name}:`, error);
                    await this.sendMessage(message.gateway, message.chatId, "💥 The claw jammed! (Error executing skill)");
                }
                handled = true;
            }
        }

        if (!handled) {
            // Optional: Default handler or conversational AI if implemented
            // For now, just ignore or log
        }
    }

    private async triggerHeartbeat() {
        logger.info('💓 Heartbeat triggered');
        // Clear rate limits to prevent memory leaks over time
        this.rateLimits.clear();

        for (const skill of this.skills.values()) {
            if (skill.onHeartbeat) {
                try {
                    await skill.onHeartbeat(this.context);
                } catch (error) {
                    logger.error(`Error in heartbeat for skill ${skill.name}:`, error);
                }
            }
        }
    }

    private async sendMessage(gatewayName: string, chatId: string, content: string) {
        const gateway = this.gateways.get(gatewayName);
        if (gateway) {
            await gateway.sendMessage(chatId, content);
        } else {
            logger.warn(`Attempted to send message via unknown gateway: ${gatewayName}`);
        }
    }

    private async broadcast(content: string) {
        // This is a simplified broadcast.
        // Real implementation needs to track known chat IDs per gateway.
        // For MVP, we might need a Store for chatIds.
        logger.info(`Broadcasting: ${content}`);
        // TODO: Implement persistent chat storage to broadcast effectively
    }
}

import schedule from 'node-schedule';
import { Gateway, Skill, Message, AgentContext, AgentConfig } from './types';
import { logger } from '../utils/logger';
import { JSONStore } from '../utils/store';

export class SathoshiClawAgent {
    private gateways: Map<string, Gateway> = new Map();
    private skills: Map<string, Skill> = new Map();
    private config: AgentConfig;
    private context: AgentContext;
    private chatStore: JSONStore<Record<string, string[]>>;

    constructor(config: AgentConfig) {
        this.config = config;
        this.chatStore = new JSONStore('chats.json', {});
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

        // Track chat ID for broadcasts
        const chats = this.chatStore.get();
        if (!chats[message.gateway]) {
            this.chatStore.update(data => {
                data[message.gateway] = [message.chatId];
            });
        } else if (!chats[message.gateway].includes(message.chatId)) {
            this.chatStore.update(data => {
                data[message.gateway].push(message.chatId);
            });
        }

        const args = message.content.split(' ');
        const command = args[0].toLowerCase();

        let handled = false;
        for (const skill of this.skills.values()) {
            if (skill.triggers.includes(command)) {
                logger.info(`Executing skill ${skill.name} for command ${command}`);
                try {
                    await skill.execute(message, args.slice(1), this.context);
                } catch (error) {
                    logger.error(`Error executing skill ${skill.name}:`, error);
                    await this.sendMessage(message.gateway, message.chatId, "💥 The claw jammed! (Error executing skill)");
                }
                handled = true;
                break; // One skill per command
            }
        }

        if (!handled) {
            // Optional: Default handler or conversational AI if implemented
            // For now, just ignore or log
        }
    }

    private async triggerHeartbeat() {
        logger.info('💓 Heartbeat triggered');
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
        logger.info(`Broadcasting: ${content}`);

        const chats = this.chatStore.get();
        let broadcastCount = 0;

        for (const [gatewayName, chatIds] of Object.entries(chats)) {
            const gateway = this.gateways.get(gatewayName);
            if (gateway) {
                for (const chatId of chatIds) {
                    try {
                        await gateway.sendMessage(chatId, content);
                        broadcastCount++;
                    } catch (error) {
                        logger.error(`Failed to broadcast to ${chatId} on ${gatewayName}:`, error);
                    }
                }
            } else {
                logger.warn(`Cannot broadcast on unknown gateway: ${gatewayName}`);
            }
        }

        logger.info(`Broadcast complete. Sent to ${broadcastCount} chats.`);
    }
}

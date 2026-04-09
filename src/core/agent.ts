import schedule from 'node-schedule';
import { Gateway, Skill, Message, AgentContext, AgentConfig } from './types';
import { logger } from '../utils/logger';
import { JSONStore } from '../utils/store';

interface ChatStore {
    [gateway: string]: string[];
}

export class SathoshiClawAgent {
    private gateways: Map<string, Gateway> = new Map();
    private skills: Map<string, Skill> = new Map();
    private config: AgentConfig;
    private context: AgentContext;
    private chatStore: JSONStore<ChatStore>;

    constructor(config: AgentConfig) {
        this.config = config;
        this.chatStore = new JSONStore<ChatStore>('chats.json', {});
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
        const MAX_MESSAGE_LENGTH = 4096;

        if (!message.content || message.content.length > MAX_MESSAGE_LENGTH) {
            logger.warn(`Ignored incoming message from ${message.gateway} due to missing content or exceeding length limit of ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }

        logger.debug(`Received message from ${message.gateway}: ${message.content}`);

        // Register chat ID for broadcasting
        const storeData = this.chatStore.get();
        if (!storeData[message.gateway]) {
            storeData[message.gateway] = [];
        }
        if (!storeData[message.gateway].includes(message.chatId)) {
            storeData[message.gateway].push(message.chatId);
            this.chatStore.save();
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
        const storeData = this.chatStore.get();

        for (const gatewayName of Object.keys(storeData)) {
            const gateway = this.gateways.get(gatewayName);
            if (gateway) {
                for (const chatId of storeData[gatewayName]) {
                    try {
                        await gateway.sendMessage(chatId, content);
                    } catch (error) {
                        logger.error(`Failed to broadcast to ${gatewayName}:${chatId}:`, error);
                    }
                }
            } else {
                logger.warn(`Gateway ${gatewayName} not found for broadcast.`);
            }
        }
    }
}

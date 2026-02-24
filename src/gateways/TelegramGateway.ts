import { Bot } from "grammy";
import { BaseGateway } from '../core/gateway';
import { logger } from '../utils/logger';

export class TelegramGateway extends BaseGateway {
    name = 'TelegramGateway';
    private bot: Bot | null = null;
    private token: string;

    constructor(token: string) {
        super();
        this.token = token;
    }

    async start(): Promise<void> {
        if (!this.token) {
            logger.warn('Telegram token not provided. Gateway disabled.');
            return;
        }

        try {
            this.bot = new Bot(this.token);

            this.bot.command("start", (ctx) => ctx.reply("🦞 SathoshiClaw is online! /claw to start mining."));

            this.bot.on("message:text", (ctx) => {
                const message = {
                    id: ctx.msg.message_id.toString(),
                    content: ctx.msg.text,
                    sender: ctx.msg.from.username || ctx.msg.from.first_name,
                    chatId: ctx.chat.id.toString(),
                    gateway: this.name,
                    timestamp: ctx.msg.date * 1000
                };

                // Only emit if it starts with / (commands) or if we want to process all text
                // For now, let's process all text, agent handles commands
                this.emitMessage(message);
            });

            this.bot.catch((err) => {
                logger.error(`Telegram Error:`, err);
            });

            // Start bot without awaiting to allow other gateways to start
            this.bot.start({
                onStart: (botInfo) => {
                    logger.info(`Telegram bot started as @${botInfo.username}`);
                }
            });

        } catch (error) {
            logger.error('Failed to initialize Telegram bot:', error);
        }
    }

    async stop(): Promise<void> {
        if (this.bot) {
            await this.bot.stop();
        }
    }

    async sendMessage(chatId: string, content: string): Promise<void> {
        if (this.bot) {
            try {
                await this.bot.api.sendMessage(chatId, content, { parse_mode: "Markdown" });
            } catch (error) {
                logger.error(`Failed to send Telegram message to ${chatId}:`, error);
            }
        }
    }
}

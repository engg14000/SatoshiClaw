import { Message, Gateway } from './types';
import { logger } from '../utils/logger';

export abstract class BaseGateway implements Gateway {
    abstract name: string;
    protected messageHandler?: (message: Message) => void;

    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract sendMessage(chatId: string, content: string): Promise<void>;

    onMessage(handler: (message: Message) => void): void {
        this.messageHandler = handler;
        logger.info(`[${this.name}] Message handler registered.`);
    }

    protected emitMessage(message: Message): void {
        if (this.messageHandler) {
            this.messageHandler(message);
        } else {
            logger.warn(`[${this.name}] Received message but no handler registered.`);
        }
    }
}

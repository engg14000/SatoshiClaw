import readline from 'readline';
import { BaseGateway } from '../core/gateway';
import { logger } from '../utils/logger';

export class ConsoleGateway extends BaseGateway {
    name = 'ConsoleGateway';
    private rl: readline.Interface | null = null;

    async start(): Promise<void> {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.rl.on('line', (line) => {
            if (line.trim()) {
                this.emitMessage({
                    id: Date.now().toString(),
                    content: line.trim(),
                    sender: 'User',
                    chatId: 'console',
                    gateway: this.name,
                    timestamp: Date.now()
                });
            }
            this.prompt();
        });

        logger.info('Console Gateway started. Type commands here (e.g. /claw)');
        this.prompt();
    }

    async stop(): Promise<void> {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }

    async sendMessage(chatId: string, content: string): Promise<void> {
        console.log(`\n[BOT]: ${content}\n`);
        this.prompt();
    }

    private prompt() {
        if (this.rl) {
            this.rl.prompt();
        }
    }
}

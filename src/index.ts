import { SathoshiClawAgent } from './core/agent';
import { ConsoleGateway } from './gateways/ConsoleGateway';
import { TelegramGateway } from './gateways/TelegramGateway';
import { WhatsAppGateway } from './gateways/WhatsAppGateway';
import { ClawSkill } from './skills/ClawSkill';
import { MemeGeneratorSkill } from './skills/MemeGeneratorSkill';
import { StatsTrackerSkill } from './skills/StatsTrackerSkill';
import { config } from './config';
import { logger } from './utils/logger';

async function main() {
    logger.info("Initializing SathoshiClaw...");

    const agent = new SathoshiClawAgent({
        telegramToken: config.telegramToken,
        whatsappEnabled: config.enableWhatsApp,
        heartbeatInterval: config.heartbeatInterval,
        memeIntensity: config.memeIntensity
    });

    // Register Gateways
    if (config.enableConsole) {
        agent.registerGateway(new ConsoleGateway());
    }

    if (config.enableTelegram && config.telegramToken) {
        agent.registerGateway(new TelegramGateway(config.telegramToken));
    } else if (config.enableTelegram && !config.telegramToken) {
        logger.warn('Telegram enabled but no token provided. Skipping Telegram gateway.');
    }

    if (config.enableWhatsApp) {
        agent.registerGateway(new WhatsAppGateway());
    }

    // Register Skills
    agent.registerSkill(new ClawSkill());
    agent.registerSkill(new MemeGeneratorSkill());
    agent.registerSkill(new StatsTrackerSkill());

    // Start
    await agent.start();

    // Handle shutdown
    process.on('SIGINT', async () => {
        logger.info('Received SIGINT. Shutting down...');
        await agent.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM. Shutting down...');
        await agent.stop();
        process.exit(0);
    });
}

main().catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
});

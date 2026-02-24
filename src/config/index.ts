import dotenv from 'dotenv';
dotenv.config();

export const config = {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN,
    enableTelegram: process.env.ENABLE_TELEGRAM === 'true',
    enableWhatsApp: process.env.ENABLE_WHATSAPP === 'true',
    enableConsole: process.env.ENABLE_CONSOLE === 'true',
    heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL_MINUTES || '60'),
    memeIntensity: parseInt(process.env.MEME_INTENSITY || '100'),
    logLevel: process.env.LOG_LEVEL || 'info',
};

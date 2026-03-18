import makeWASocket, { useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import { BaseGateway } from '../core/gateway';
import { logger } from '../utils/logger';

// Remove direct import of Boom to avoid dependency issues if not explicitly installed
// import { Boom } from '@hapi/boom';

export class WhatsAppGateway extends BaseGateway {
    name = 'WhatsAppGateway';
    private socket: any;

    async start(): Promise<void> {
        logger.info('Starting WhatsApp Gateway...');
        await this.connectToWhatsApp();
    }

    private async connectToWhatsApp() {
        // Ensure auth folder exists
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        // @ts-ignore
        this.socket = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: undefined // Let Baileys handle logging internally or silence it
        });

        this.socket.ev.on('creds.update', saveCreds);

        this.socket.ev.on('connection.update', (update: any) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                logger.info('Please scan the QR code for WhatsApp (check terminal)');
            }

            if (connection === 'close') {
                const error = lastDisconnect?.error as any;
                // Check if error is 401 (logged out)
                const shouldReconnect = error?.output?.statusCode !== DisconnectReason.loggedOut;

                logger.warn(`WhatsApp connection closed. Reconnecting: ${shouldReconnect}`);

                if (shouldReconnect) {
                    this.connectToWhatsApp();
                } else {
                    logger.error('WhatsApp logged out. Please delete auth_info_baileys and restart.');
                }
            } else if (connection === 'open') {
                logger.info('WhatsApp connection opened!');
            }
        });

        this.socket.ev.on('messages.upsert', async (m: any) => {
            if (m.type === 'notify') {
                for (const msg of m.messages) {
                    if (!msg.message) continue;
                    if (msg.key.fromMe) continue; // Ignore my own messages

                    const remoteJid = msg.key.remoteJid;
                    const content = msg.message.conversation || msg.message.extendedTextMessage?.text;

                    if (content) {
                        this.emitMessage({
                            id: msg.key.id || Date.now().toString(),
                            content: content,
                            sender: msg.pushName || remoteJid,
                            chatId: remoteJid,
                            gateway: this.name,
                            timestamp: (msg.messageTimestamp as number) * 1000
                        });
                    }
                }
            }
        });
    }

    async stop(): Promise<void> {
        if (this.socket) {
            this.socket.end(undefined);
        }
    }

    async sendMessage(chatId: string, content: string): Promise<void> {
        if (this.socket) {
            try {
                await this.socket.sendMessage(chatId, { text: content });
            } catch (error) {
                logger.error(`Failed to send WhatsApp message to ${chatId}:`, error);
            }
        }
    }
}

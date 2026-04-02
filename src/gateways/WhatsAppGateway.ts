import makeWASocket, { useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import { BaseGateway } from '../core/gateway';
import { logger } from '../utils/logger';

// Remove direct import of Boom to avoid dependency issues if not explicitly installed
// import { Boom } from '@hapi/boom';

/**
 * Interface representing the connection update state from Baileys.
 */
interface ConnectionUpdate {
    connection?: 'close' | 'open' | 'connecting';
    lastDisconnect?: {
        error: any;
        date: Date;
    };
    qr?: string;
}

/**
 * Interface representing the message upsert event from Baileys.
 */
interface MessageUpsert {
    messages: any[];
    type: 'append' | 'notify';
}

/**
 * WhatsAppGateway handles communication via the WhatsApp platform using the Baileys library.
 */
export class WhatsAppGateway extends BaseGateway {
    name = 'WhatsAppGateway';
    private socket: WASocket | null = null;

    /**
     * Starts the WhatsApp gateway and initiates the connection process.
     */
    async start(): Promise<void> {
        logger.info('Starting WhatsApp Gateway...');
        await this.connectToWhatsApp();
    }

    /**
     * Connects to WhatsApp and sets up event listeners for connection updates and incoming messages.
     */
    private async connectToWhatsApp() {
        // Ensure auth folder exists for persistent sessions
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        // @ts-ignore - Baileys library may have complex internal types
        this.socket = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: undefined // Let Baileys handle logging internally or silence it
        });

        if (!this.socket) {
            logger.error('Failed to initialize WhatsApp socket.');
            return;
        }

        this.socket.ev.on('creds.update', saveCreds);

        this.socket.ev.on('connection.update', (update: ConnectionUpdate) => {
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

        this.socket.ev.on('messages.upsert', async (m: MessageUpsert) => {
            if (m.type === 'notify') {
                for (const msg of m.messages) {
                    if (!msg.message) continue;
                    if (msg.key.fromMe) continue; // Ignore own outgoing messages

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

    /**
     * Gracefully stops the WhatsApp gateway and closes the active socket.
     */
    async stop(): Promise<void> {
        if (this.socket) {
            logger.info('Stopping WhatsApp Gateway...');
            this.socket.end(undefined);
            this.socket = null;
        }
    }

    /**
     * Sends a text message to a specified WhatsApp chat ID.
     */
    async sendMessage(chatId: string, content: string): Promise<void> {
        if (this.socket) {
            try {
                await this.socket.sendMessage(chatId, { text: content });
            } catch (error) {
                logger.error(`Failed to send WhatsApp message to ${chatId}:`, error);
            }
        } else {
            logger.warn(`Cannot send WhatsApp message to ${chatId} because the gateway is disconnected.`);
        }
    }
}

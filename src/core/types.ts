export interface Message {
    id: string;
    content: string;
    sender: string;
    chatId: string;
    gateway: string; // 'telegram', 'whatsapp', 'console'
    timestamp: number;
}

export interface Gateway {
    name: string;
    start(): Promise<void>;
    stop(): Promise<void>;
    sendMessage(chatId: string, content: string): Promise<void>;
    onMessage(handler: (message: Message) => void): void;
}

export interface Skill {
    name: string;
    description: string;
    triggers: string[]; // e.g. ['/claw', '/help']

    // Called when a message matches a trigger
    execute(message: Message, args: string[], agent: AgentContext): Promise<void>;

    // Optional: Called on every heartbeat
    onHeartbeat?(agent: AgentContext): Promise<void>;
}

export interface AgentContext {
    sendMessage(gatewayName: string, chatId: string, content: string): Promise<void>;
    broadcast(content: string): Promise<void>; // Send to all known chats
    logger: any;
    config: any;
}

export interface AgentConfig {
    telegramToken?: string;
    whatsappEnabled: boolean;
    heartbeatInterval: number; // minutes
    memeIntensity: number;
}

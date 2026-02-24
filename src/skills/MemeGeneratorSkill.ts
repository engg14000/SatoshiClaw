import { BaseSkill } from '../core/skill';
import { Message, AgentContext } from '../core/types';
import { getRandomMeme, FAILURE_MEMES, STATUS_MEMES } from '../utils/memes';

const MEME_TEMPLATES = [
    ...FAILURE_MEMES,
    ...STATUS_MEMES,
    "Bitcoin fixes this.",
    "Have fun staying poor.",
    "Not your keys, not your coins.",
    "Wen Lambo?",
    "To the moon! 🚀",
    "Buy high, sell low.",
    "1 BTC = 1 BTC",
    "Long Bitcoin, Short the Banks."
];

export class MemeGeneratorSkill extends BaseSkill {
    name = 'MemeGeneratorSkill';
    description = 'Generates high-quality crypto memes.';
    triggers = ['/meme', '/joke'];

    async execute(message: Message, args: string[], agent: AgentContext): Promise<void> {
        const meme = getRandomMeme(MEME_TEMPLATES);
        await agent.sendMessage(message.gateway, message.chatId, `🦞 ${meme}`);
    }
}

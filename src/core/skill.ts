import { Skill, Message, AgentContext } from './types';

export abstract class BaseSkill implements Skill {
    abstract name: string;
    abstract description: string;
    abstract triggers: string[];

    abstract execute(message: Message, args: string[], agent: AgentContext): Promise<void>;

    // Optional override
    async onHeartbeat(agent: AgentContext): Promise<void> {
        // Default: do nothing
    }

    protected isTrigger(command: string): boolean {
        return this.triggers.includes(command.toLowerCase());
    }
}

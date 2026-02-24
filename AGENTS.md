# AGENTS.md for SathoshiClaw

## Project Goal
You are working on "SathoshiClaw", a satirical AI agent.
Every line of code and comment should reflect the "OpenClaw" architecture but with a meme-focused, crypto-mining larp theme.

## Coding Standards
- **Style**: Use TypeScript. Strict mode.
- **Comments**: Extremely verbose, educational, and funny. Every function should explain what it does in a "trying to find Satoshi" context.
- **Architecture**:
    - `src/core`: The brain (Agent, Skill interface, Gateway interface).
    - `src/skills`: The abilities (ClawSkill, MemeSkill, StatsSkill).
    - `src/gateways`: The mouths (Telegram, WhatsApp, Console).
    - `src/utils`: The tools (Crypto, Logger).

## Meme Directives
- If a function fails, log it as "The blockchain rejected our vibe."
- If a key is invalid, log it as "Not Satoshi. Probably Craig Wright."
- DISCLAIMERS ARE MANDATORY. Never imply this can actually hack Bitcoin.

## Testing
- Use the `ConsoleGateway` to test the loop without needing real API keys.
- Run `npm start` to fire up the agent.

import { BaseSkill } from '../core/skill';
import { Message, AgentContext } from '../core/types';
import { generateRandomKey, getProbabilityOfFindingSatoshi } from '../utils/crypto';
import { JSONStore } from '../utils/store';
import { getRandomMeme, FAILURE_MEMES, STATUS_MEMES } from '../utils/memes';
import { logger } from '../utils/logger';
import { Worker } from 'worker_threads';
import * as path from 'path';

interface ClawStats {
  totalAttempts: number;
  lastAttemptTime: number;
  keysFound: number; // lol
  satoshiFound: boolean;
  startTime: number;
}

const DEFAULT_STATS: ClawStats = {
  totalAttempts: 0,
  lastAttemptTime: Date.now(),
  keysFound: 0,
  satoshiFound: false,
  startTime: Date.now()
};

export class ClawSkill extends BaseSkill {
  name = 'ClawSkill';
  description = 'The relentless search for Satoshi\'s keys.';
  triggers = ['/claw', '/status', '/mine'];

  private statsStore: JSONStore<ClawStats>;
  private isMining = false;
  private worker: Worker | null = null;

  constructor() {
    super();
    this.statsStore = new JSONStore('stats.json', DEFAULT_STATS);
    this.startMiningLoop();
  }

  private startMiningLoop() {
    if (this.isMining) return;
    this.isMining = true;

    // Determine the correct path to the worker file whether compiled or not
    const isTsNode = process.env.TS_NODE_DEV || (process as any)[Symbol.for('ts-node.register.instance')];
    const workerFile = isTsNode ? 'claw.worker.ts' : 'claw.worker.js';
    const workerPath = path.join(__dirname, workerFile);

    const workerOptions = isTsNode ? { execArgv: ['-r', 'ts-node/register'] } : {};
    this.worker = new Worker(workerPath, workerOptions);

    this.worker.on('message', (message) => {
      if (message.type === 'MINING_RESULT') {
        const stats = this.statsStore.get();
        const { totalAttempts, satoshiFound, foundAddress, lastAttemptTime } = message.payload;

        stats.totalAttempts += totalAttempts;
        stats.lastAttemptTime = lastAttemptTime;

        if (satoshiFound) {
            stats.satoshiFound = true;
            logger.error(`HOLY CRAP WE FOUND SATOSHI: ${foundAddress}`);
        }
      }
    });

    this.worker.on('error', (err) => {
      logger.error('Claw Worker error:', err);
    });

    this.worker.on('exit', (code) => {
      if (code !== 0) {
        logger.error(`Claw Worker stopped with exit code ${code}`);
      }
    });

    this.worker.postMessage({
        type: 'START_MINING',
        count: 100,
        interval: 100
    });

    // Separate loop for saving stats to avoid disk thrashing
    setInterval(() => {
      this.statsStore.save();
    }, 5000); // Save every 5 seconds
  }

  // kept for backwards compatibility / manual invocations if needed, but not used in the background loop anymore
  private performClaws(count: number) {
      if (this.worker) {
          this.worker.postMessage({
              type: 'PERFORM_CLAWS',
              count
          });
      }
  }

  async execute(message: Message, args: string[], agent: AgentContext): Promise<void> {
    const command = message.content.split(' ')[0].toLowerCase();

    if (command === '/claw' || command === '/mine') {
      const key = generateRandomKey();
      const meme = getRandomMeme(FAILURE_MEMES);

      const response = `
🦞 *CLAW ATTEMPT #${this.statsStore.get().totalAttempts}* 🦞
--------------------------------
🔑 Private Key: ||${key.privateKey.substring(0, 8)}...[REDACTED]||
TBTC Address: \`${key.address}\`
--------------------------------
❌ MATCH: FALSE (Not Satoshi)
💬 ${meme}

⚠️ _This is a simulation. Do not use generated keys._
`;
      await agent.sendMessage(message.gateway, message.chatId, response);
    }

    else if (command === '/status') {
      const stats = this.statsStore.get();
      const uptime = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(2); // minutes
      const hashrate = "1 kH/s (Meme Power)"; // Fake constant hashrate
      const prob = getProbabilityOfFindingSatoshi();

      const response = `
📊 *SATHOSHICLAW STATUS* 📊
--------------------------------
🦞 Total Claws: ${stats.totalAttempts.toLocaleString()}
⏱ Uptime: ${uptime} minutes
⚡ Hashrate: ${hashrate}
💀 Keys Found: ${stats.keysFound}
🏆 Satoshi Found: ${stats.satoshiFound ? "YES (Liar)" : "NO"}
--------------------------------
💬 ${getRandomMeme(STATUS_MEMES)}
probability: 1 in 2^256
`;
      await agent.sendMessage(message.gateway, message.chatId, response);
    }
  }

  async onHeartbeat(agent: AgentContext): Promise<void> {
      // Send a random update to the log, or broadcast if configured
      const stats = this.statsStore.get();
      if (stats.totalAttempts % 1000 === 0) {
          logger.info(`[Heartbeat] Still clawing. Total attempts: ${stats.totalAttempts}`);
      }

      // Every heartbeat interval, maybe broadcast a funny update to known chats?
      // Need a way to store "subscribed" chats. skipping for now to keep it simple.
  }
}

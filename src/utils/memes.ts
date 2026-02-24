export const FAILURE_MEMES = [
  "Claw slipped! Just like my life choices. 🦞",
  "So close! Only 2^255 keys to go. 💀",
  "Error: Universe heat death imminent. Try again later.",
  "Satoshi is laughing at us from the citadel.",
  "Found 0 BTC. Found 1 Depresso. ☕",
  "Hashrate: 1 potato/sec. 🥔",
  "Your key is in another castle. 🏰",
  "404: Lambo not found.",
  "Address empty. Just like my wallet.",
  "Vitalik would have found it by now. (jk he wouldn't)",
  "Proof of Work? More like Proof of Waste.",
  "Keep clawing! The yacht is one key away!"
];

export const STATUS_MEMES = [
  "Current mood: HODLing onto hope.",
  "Clawing harder than a cat on a screen door.",
  "Mining... but for comedy gold.",
  "Syncing with the meme-pool...",
  "Searching for the CEO of Bitcoin..."
];

export function getRandomMeme(list: string[] = FAILURE_MEMES): string {
  return list[Math.floor(Math.random() * list.length)];
}

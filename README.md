# 🦞 SathoshiClaw: The Viral Bitcoin-Clawing Meme Agent

![SathoshiClaw Logo](https://i.imgur.com/placeholder_logo.png)

**"Finding Satoshi's Private Key... one failed attempt at a time."**

SathoshiClaw is a **self-hosted, autonomous, local-first AI assistant** whose ONLY life purpose is to find Satoshi Nakamoto's private key by randomly "clawing" 256-bit keys in an endless, hilarious, arcade-style loop.

> **⚠️ WARNING & DISCLAIMER ⚠️**
> **THIS IS PURE SATIRE AND ENTERTAINMENT.**
> - Cracking Bitcoin's 256-bit security is MATHEMATICALLY IMPOSSIBLE with current technology.
> - The heat death of the universe will happen before you find a collision.
> - This project does NOT hack anything. It generates random numbers and checks them against public addresses.
> - Do not use this for illegal activities. It is an educational tool about probability and cryptography.

---

## 🚀 Features

- **The Claw™**: Continuous, non-blocking background mining loop generating random keys.
- **Meme Engine**: Every response is dripping with crypto-twitter sarcasm and despair.
- **Multi-Platform**: Chat with SathoshiClaw on **Telegram**, **WhatsApp**, and **Console**.
- **Heartbeat Mode**: Wakes up every hour to tell you it failed again (but in a funny way).
- **Extensible Skills**: Add your own "Claws" (skills) easily.
- **Docker-First**: Deploy in seconds.

## 🛠 Installation

### Option 1: Docker (Recommended)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/sathoshiclaw.git
   cd sathoshiclaw
   ```

2. **Configure:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Telegram Bot Token or enable WhatsApp
   ```

3. **Run:**
   ```bash
   docker-compose up -d
   ```

### Option 2: Manual (Node.js)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Run:**
   ```bash
   npm start
   ```

## 🤖 Commands

| Command | Description |
| :--- | :--- |
| `/claw` | **Manual Claw Attempt**. Generate a key and check for Satoshi immediately. |
| `/status` | **System Status**. View uptime, hashrate (meme power), and total failures. |
| `/meme` | **Generate Meme**. Get a fresh crypto meme or inspirational quote. |
| `/stats` | **Server Stats**. CPU usage, memory, and OS info. |

## 🦞 How It Works

1. **The Brain**: `src/core/agent.ts` manages the loop and skills.
2. **The Mouths**: `src/gateways/` handles Telegram, WhatsApp, etc.
3. **The Claw**: `src/skills/ClawSkill.ts` generates random private keys using `secp256k1` and checks if the derived address matches known Satoshi addresses (e.g., Genesis Block).
4. **The Soul**: It knows it will fail, but it tries anyway. That is the essence of crypto.

## 🤝 Contributing

We welcome new Skills!
1. Create a file in `src/skills/MyNewSkill.ts`.
2. Extend `BaseSkill`.
3. Register it in `src/index.ts`.
4. PR it!

## 📜 License

MIT License. Free to fork, modify, and meme.

---

*"I think I found it... wait, that's just a dust attack."* — SathoshiClaw

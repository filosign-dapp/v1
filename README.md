# Portal 🥷

**Share files like a NINJA.**

Trustless file sharing platform. Files are encrypted client-side before upload to IPFS. We never see your content.

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://fblsd54i.pinit.eth.limo)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

**Free Tier (Off-Chain)**
- Client-side encryption (Web Crypto API)
- IPFS decentralized storage
- Zero-knowledge password protection
- URL fragment keys (`portal.xyz/file/[CID]#[SECRET_KEY]`)

**Pro Tier (Web3)**
- Wallet-based access control
- Monetized links with paywalls
- Permanent Filecoin storage deals
- Smart contract enforced expiry
- NFT-powered themes

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router, Tailwind CSS
- **Backend**: Hono, Bun, Drizzle ORM, Neon Database
- **Web3**: IPFS, Filecoin, Privy, Wagmi, Viem
- **Contracts**: Solidity, Hardhat, FVM

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/portal.git
cd portal
bun install

# Setup environment
cd packages/server
cp .env.template .env
# Edit .env with your configuration

# Run development server
bun run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
portal/
├── packages/
│   ├── contracts/          # Smart contracts
│   └── server/            # Full-stack app
│       ├── api/           # Backend (Hono)
│       └── src/           # Frontend (React)
└── README.md
```

## 🔧 Development

```bash
# Development
bun run dev          # Start dev server
bun run build        # Build for production
bun run start        # Start production server

# Smart Contracts
cd packages/contracts
bun run test         # Run tests
bun run deploy       # Deploy contracts
```

## 🔐 Security

- **Zero-Knowledge**: Decryption keys in URL fragments, never sent to server
- **Client-side Encryption**: All encryption happens in browser
- **Decentralized Storage**: Files on IPFS, not centralized servers
- **Smart Contract Enforcement**: Pro features enforced by blockchain

## 🔗 Links

- **Demo**: [https://portal-plgenesis.onrender.com](Live)

---

*Zero-knowledge file sharing with Web3 superpowers.*

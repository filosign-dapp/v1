# Portal 🥷

**Share files like a NINJA.**

Trustless file sharing platform. Files are encrypted client-side before upload to IPFS. We can't see what's in them.

## ✨ Features

**Free Tier (Off-Chain)**
- Client-side encryption (AES-256)
- IPFS decentralized storage
- URL fragment keys (`portal.xyz/file/[CID]#[SECRET_KEY]`)

**Pro Tier (Web3)**
- Wallet-based access control
- Monetized links with paywalls
- Permanent Filecoin storage deals
- Smart contract enforced expiry

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router, Tailwind CSS
- **Backend**: IPFS, Filecoin, Privy, Wagmi, Viem, Bun, Hono
- **Contracts**: Solidity, Hardhat, Filecoin Calibration, FVM

## 🚀 Quick Start

```bash
# install
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
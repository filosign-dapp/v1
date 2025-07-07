# Portal - Web3 File Sharing dApp

**Built for Protocol Labs & Filecoin Hackathon**

Portal is a decentralized file sharing dApp built on Filecoin that enables secure, encrypted file sharing with blockchain-based access control. Users maintain complete control over who can access their files through smart contract-enforced permissions.

## Key Features

- **End-to-End Encryption**: Files encrypted client-side with recipient-specific keys
- **Filecoin Storage**: Decentralized storage on IPFS via Web3 Storage
- **Smart Contract Access Control**: Grant and revoke access on-chain
- **USDFC Token Payments**: Native token for platform fees
- **Wallet Integration**: MetaMask and Web3 wallet support
- **Revocable Sharing**: Dynamically control file access

## Architecture

- **Smart Contracts** - Solidity contracts on Filecoin Calibration
- **Frontend** - React dApp with Web3 integration
- **Backend** - Hono API server with PostgreSQL

## Tech Stack

- **Blockchain**: Filecoin Calibration, Solidity, Hardhat
- **Frontend**: React 19, Wagmi, Privy, TanStack Router
- **Backend**: Hono, Bun, Drizzle ORM
- **Storage**: Web3 Storage, IPFS

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Start development
cd packages/server && bun dev
```

## Core Smart Contracts

- **PortalOrchestrator**: Main system coordinator
- **IAM**: User registration and key management
- **KeyManager**: File access control and encryption keys
- **SubHandler**: Subscription and payment handling
- **UploadRegistry**: File metadata tracking

## How It Works

1. **Register**: Create account with encryption keys on Filecoin
2. **Upload**: Encrypt files client-side, store on IPFS
3. **Share**: Grant access through smart contracts
4. **Control**: Revoke or modify access anytime
5. **Pay**: Use USDFC tokens for platform operations

## Security

- Zero-knowledge architecture - platform never sees plaintext
- Client-side encryption with AES-256
- Blockchain-enforced access control
- Signature verification for all operations 
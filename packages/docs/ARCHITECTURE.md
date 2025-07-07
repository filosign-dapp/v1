# Portal Architecture

Portal is a Web3 dApp built on Filecoin that combines decentralized storage with blockchain-based access control for secure file sharing.

## System Overview

Portal uses a three-layer architecture:

1. **Smart Contracts** - Filecoin-based identity, access control, and payments
2. **Web3 Frontend** - React dApp with Web3 wallet integration
3. **IPFS Storage** - Decentralized file storage via Web3 Storage

## Architecture Flow

```
React dApp → Smart Contracts → IPFS Storage
     ↓              ↓              ↓
  Web3 Auth    Access Control   Encrypted Files
```

## Core Components

### Smart Contract Layer (Filecoin)

**PortalOrchestrator** - Main system coordinator
- Manages all contract interactions
- Handles USDFC token payments
- Coordinates between all system components

**IAM** - Identity and Access Management
- User registration with encryption keys
- Public key storage and resolution
- Signature-based authentication

**KeyManager** - File Access Control
- Stores encrypted file keys per recipient
- Manages access permissions
- Handles key sharing and revocation

**SubHandler** - Payment Management
- Subscription and billing logic
- Payment processing with USDFC tokens

**UploadRegistry** - File Metadata
- Tracks file uploads and ownership
- Maintains file metadata on-chain

### Frontend Layer (React)

**Web3 Integration**
- Privy for wallet authentication
- Wagmi for blockchain interactions
- Viem for contract communications

**Core Pages**
- Upload: File encryption and sharing
- History: Manage uploaded files
- Shared: Access received files
- Profile: Account and wallet management

### Storage Layer (IPFS)

**Web3 Storage Integration**
- Encrypted file storage on IPFS
- Content addressing with CIDs
- Global file availability

## Data Flow

### File Upload Process

1. **User uploads file** → Client-side AES encryption
2. **Recipients specified** → Generate keys per recipient
3. **Upload to IPFS** → Store encrypted file, get CID
4. **Keys stored on-chain** → Store encrypted keys in KeyManager
5. **Payment processed** → USDFC tokens charged

### File Access Process

1. **User requests file** → Smart contract validates access
2. **Key retrieval** → Fetch encrypted key from KeyManager
3. **Key decryption** → Decrypt key with user's private key
4. **File download** → Download encrypted file from IPFS
5. **File decryption** → Decrypt file client-side

### User Registration

1. **Connect wallet** → Web3 wallet authentication
2. **Generate keys** → Create encryption key pair
3. **Register on-chain** → Store public key in IAM contract
4. **Pay fee** → 1 USDFC registration fee

## Security Model

### Encryption
- **Client-side AES-256** encryption before upload
- **Recipient-specific keys** for each shared file
- **ECDH key exchange** for secure key sharing
- **Zero-knowledge** - platform never sees plaintext

### Access Control
- **Smart contract enforcement** of access rules
- **Signature verification** for all operations
- **Revocable permissions** managed on-chain
- **Time-based expiration** for shared files

### Payment Security
- **USDFC token** integration
- **Allowance pattern** for secure payments
- **Transparent fees** with smart contract automation 
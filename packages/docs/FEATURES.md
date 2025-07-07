# Features

Portal is a Web3 dApp for secure, encrypted file sharing on Filecoin with blockchain-based access control.

## Core Features

### 🔐 **End-to-End Encryption**
- Client-side AES-256 encryption before upload
- Recipient-specific encryption keys
- Zero-knowledge architecture - platform never sees plaintext
- ECDH key exchange for secure key sharing

### 🌐 **Decentralized Storage**
- IPFS storage via Web3 Storage
- Content-addressed files with CIDs
- Global availability and redundancy
- Immutable file records

### 🎯 **Smart Contract Access Control**
- On-chain permission management
- Revocable file sharing
- Time-based access expiration
- Irrevocable file options for permanent sharing

### 💰 **USDFC Token Payments**
- Native token for all platform fees
- Transparent fee structure
- Registration fee: 1 USDFC
- Pay-per-use for uploads and sharing

### 🔑 **Web3 Identity**
- Filecoin-based user accounts
- Public key infrastructure
- Wallet-based authentication
- Signature verification for all operations

## User Interface

### 📤 **Upload Page**
- Drag & drop file upload
- Multi-file and directory support
- Recipient specification by wallet address
- Access control configuration
- Real-time encryption and IPFS upload

### 📊 **History Page**
- List of uploaded files with metadata
- Access management controls
- Revenue tracking from shared files
- Bulk operations for file management

### 📨 **Shared With You**
- Files received from other users
- Download functionality with decryption
- Sender information and sharing details

### 👤 **Profile Page**
- Wallet connection status
- Registration and account verification
- Upload/download statistics
- Payment history

### 🔗 **Link Sharing**
- Secure download links for recipients
- Link expiration settings
- Access tracking

## Security Model

### Zero-Knowledge Design
- Files encrypted client-side before leaving browser
- Platform cannot decrypt or access file contents
- Private keys never transmitted or stored
- Secure key derivation from wallet signatures

### Access Control
- Smart contract enforcement of permissions
- Granular per-file access management
- Dynamic revocation capabilities
- Audit trail of all access events

### Payment Security
- USDFC token allowance pattern
- Smart contract automation
- Transparent fee calculations

## User Workflows

### Getting Started
1. Connect Web3 wallet (MetaMask, etc.)
2. Register account and generate encryption keys
3. Pay 1 USDFC registration fee
4. Start uploading and sharing files

### File Sharing Process
1. Select files and specify recipients
2. Configure access permissions and expiration
3. Files encrypted client-side with AES-256
4. Upload to IPFS, store keys on Filecoin
5. Recipients receive secure download links

### Access Management
- Grant additional recipients access
- Revoke permissions anytime (unless irrevocable)
- Monitor download activity and statistics
- Make files permanently accessible

## Use Cases

### Personal
- **Secure document sharing** with family/friends
- **Photo albums** with controlled access
- **Creative work** distribution with IP protection

### Business
- **Confidential file delivery** to clients
- **Team collaboration** with access controls
- **Contract sharing** with time-limited access

### Professional
- **Legal document** sharing with audit trails
- **Research data** collaboration
- **Educational content** distribution

## Technical Integration

### Web3 Stack
- **Filecoin Calibration** testnet deployment
- **IPFS** via Web3 Storage for file storage
- **Wagmi & Viem** for blockchain interactions
- **Privy** for wallet authentication

### API Access
- RESTful endpoints for file operations
- Rate limiting and authentication
- TypeScript SDK support

Portal combines the security of end-to-end encryption with the transparency of blockchain technology to create a trustless file sharing platform where users maintain complete control over their data. 
# Smart Contracts

Portal's smart contracts on Filecoin Calibration testnet manage identity, access control, and payments for the decentralized file sharing dApp.

## Contract Overview

| Contract | Purpose |
|----------|---------|
| PortalOrchestrator | Main system coordinator and payment processing |
| IAM | User registration and identity management |
| KeyManager | File encryption key storage and access control |
| SubHandler | Subscription and payment management |
| UploadRegistry | File metadata and ownership tracking |
| USDFC | Native payment token (ERC-20) |

## PortalOrchestrator Contract

Main system coordinator that manages all contract interactions and USDFC token payments.

**Key Functions:**
- `receivePayment()` - Process payments from users
- `spend()` - Transfer tokens between addresses
- `withdraw()` - Admin withdrawal of accumulated fees

## IAM Contract

Manages user registration and identity on the Portal platform.

**Key Functions:**
- `register()` - Register new user with encryption keys
- `resolvePublicKey()` - Get public key for address
- `registered()` - Check if address is registered

**Data Structure:**
```solidity
struct Account {
    bytes pub;        // Public key
    address pubAddr;  // Public key address
    bytes32 seed;     // Unique seed
}
```

## KeyManager Contract

Stores encrypted file keys and manages access permissions.

**Key Functions:**
- `storeKey()` - Store encrypted key for recipient
- `getKey()` - Retrieve encrypted key for file
- `revokeAccess()` - Remove access permissions
- `hasAccess()` - Check user access to file
- `makeIrrevocable()` - Make file permanently accessible

## SubHandler Contract

Manages subscriptions and recurring payments.

**Key Functions:**
- `subscribe()` - Subscribe to a plan
- `cancelSubscription()` - Cancel subscription
- `getSubscriptionStatus()` - Get subscription info

## UploadRegistry Contract

Tracks file uploads and metadata on-chain.

**Key Functions:**
- `recordUpload()` - Record new file upload
- `getUploadInfo()` - Get file metadata
- `getUserUploads()` - Get all uploads for user

## USDFC Token Contract

ERC-20 token for all platform payments.

**Standard Functions:**
- `transfer()`, `approve()`, `transferFrom()`
- `balanceOf()`, `allowance()`
- `mint()` (admin only), `burn()`

## Contract Interactions

### File Upload Flow
1. User registers with `IAM.register()`
2. User approves USDFC spending
3. File encrypted client-side, uploaded to IPFS
4. Keys stored with `KeyManager.storeKey()`
5. Payment processed via `PortalOrchestrator`

### File Access Flow
1. Check access with `KeyManager.hasAccess()`
2. Get encrypted key with `KeyManager.getKey()`
3. Download file from IPFS
4. Decrypt file client-side

## Gas Costs (Approximate)
- User Registration: ~150,000 gas
- File Upload: ~100,000 gas
- Key Storage: ~50,000 gas per recipient
- Access Revocation: ~30,000 gas 
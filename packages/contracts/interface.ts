import definitions from "./definitions";
import * as viem from "viem";
import { filecoinCalibration } from "viem/chains";
import {
  decryptAES,
  deriveAESKey,
  deriveSharedKey,
  encryptAES,
  extractPrivateKeyFromSignature,
  packEncrypted,
  unpackEncrypted,
} from "./utils";
import { privateKeyToAccount } from "viem/accounts";

const primaryChain = filecoinCalibration;

type RequiredClient = viem.WalletClient<
  viem.Transport,
  typeof primaryChain,
  viem.Account,
  viem.RpcSchema | undefined
>;

class Contracts {
  private client: RequiredClient;
  static chain = primaryChain;

  constructor(client_: RequiredClient) {
    this.client = client_.extend(viem.publicActions);
    client_.switchChain({
      id: Contracts.chain.id,
    });
  }

  set account(account: viem.Account) {
    this.client.account = account;
    this.client = this.client.extend(viem.publicActions);
  }

  get account() {
    return this.client.account;
  }

  get interfaces() {
    return {
      portalOrchestrator: viem.getContract({
        ...definitions.PortalOrchestrator,
        client: this.client,
      }),

      iam: viem.getContract({
        ...definitions.IAM,
        client: this.client,
      }),

      subHandler: viem.getContract({
        ...definitions.SubHandler,
        client: this.client,
      }),

      keyManager: viem.getContract({
        ...definitions.KeyManager,
        client: this.client,
      }),

      usdfc: viem.getContract({
        ...definitions.usdfc,
        client: this.client,
      }),
    };
  }

  get portalOrchestrator() {
    return this.interfaces.portalOrchestrator;
  }

  get iam() {
    return this.interfaces.iam;
  }

  get subHandler() {
    return this.interfaces.subHandler;
  }

  get keyManager() {
    return this.interfaces.keyManager;
  }

  get usdfc() {
    return this.interfaces.usdfc;
  }

  async register() {
    console.log("Tits");
    const seed = await this.iam.read.determineNextSeed([
      this.client.account.address,
    ]);
    const signedSeed = await this.client.signMessage({
      message: seed,
    });

    const encryptionKey = extractPrivateKeyFromSignature(signedSeed);
    const encryptionWallet = viem.createWalletClient({
      chain: Contracts.chain,
      transport: viem.http(),
      account: privateKeyToAccount(encryptionKey),
    });

    const verificationSignature = await encryptionWallet.signMessage({
      message: {
        raw: viem.keccak256(
          viem.encodePacked(
            ["address", "bytes32"],
            [this.client.account.address, seed]
          )
        ),
      },
    });

    const tx = await this.iam.write.register([
      encryptionWallet.account.publicKey,
      encryptionWallet.account.address,
      verificationSignature,
    ]);

    return tx;
  }

  async isRegistered() {
    return await this.iam.read.registered([this.client.account.address]);
  }

  private async getEncryptionKey() {
    if (!(await this.isRegistered())) {
      throw new Error("You are not registered. Please register first.");
    }

    const { 1: seed } = await this.iam.read.accounts([
      this.client.account.address,
    ]);
    return extractPrivateKeyFromSignature(
      await this.client.signMessage({
        message: seed,
      })
    );
  }

  async publishEncryptedKeys(options: {
    cid: string;
    msg: string;
    recipients: viem.Address[];
    safe?: boolean;
  }) {
    if (!(await this.isRegistered())) {
      throw new Error("You are not registered. Please register first.");
    }

    const misses: Set<viem.Address> = new Set();
    const { msg, recipients, safe } = options;

    // Ensure the uploader is included as a recipient
    const allRecipients = [
      ...new Set([...recipients, this.client.account.address]),
    ];

    const publicKeys: { originalAddress: viem.Address; pubKey: viem.Hex }[] = (
      await Promise.all(
        allRecipients.map(async (address) => {
          try {
            const pubKey = await this.iam.read.resolvePublicKey([address]);
            if (!pubKey || pubKey === "0x") {
              misses.add(address);
              if (safe) {
                throw new Error(
                  `No encryption key found for address: ${address}`
                );
              }
              return null;
            }
            return {
              originalAddress: address,
              pubKey,
            };
          } catch (error) {
            misses.add(address);
            console.error(`Error resolving public key for ${address}:`, error);
            if (safe) {
              throw new Error(`Failed to resolve public key for ${address}`);
            }
            return null;
          }
        })
      )
    ).filter(
      (entry): entry is { originalAddress: viem.Address; pubKey: viem.Hex } =>
        !!entry
    );

    const encryptionKey = await this.getEncryptionKey();

    const for_: viem.Address[] = [];
    const values_: viem.Hex[] = [];

    for await (const entry of publicKeys) {
      if (!entry.pubKey) {
        continue;
      }

      const aesKey = await deriveSharedKey(
        encryptionKey.replace(/^0x/, ""),
        entry.pubKey.replace(/^0x/, "")
      );
      const encryptedData = await encryptAES(msg, aesKey);
      const packed = packEncrypted(
        encryptedData.encrypted,
        encryptedData.iv,
        encryptedData.authTag
      );

      for_.push(entry.originalAddress);
      values_.push(packed);
    }

    await this.keyManager.write.registerUpload([options.cid, for_, values_]);
    return { misses };
  }

  async getKeyForFile(cid: string) {
    if (!(await this.isRegistered())) {
      throw new Error("You are not registered. Please register first.");
    }

    const address = this.client.account.address;

    const seed = await this.keyManager.read.getKeySeed([cid, address]);
    if (!seed || seed === "0x" || seed.length <= 2) {
      throw new Error(
        `No key seed found for CID: ${cid} and address: ${address}`
      );
    }

    // Get the uploader's address from the upload record
    const upload = await this.keyManager.read.uploads([cid]);
    const ownerAddress = upload[1]; // uploader is the first element

    if (
      !ownerAddress ||
      ownerAddress === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(`No uploader found for CID: ${cid}`);
    }

    const encryptionKey = await this.getEncryptionKey();
    // Get the actual uploader's public key
    const uploaderPublicKey = await this.iam.read.resolvePublicKey([
      ownerAddress,
    ]);

    if (!uploaderPublicKey || uploaderPublicKey === "0x") {
      throw new Error(`No public key found for uploader: ${ownerAddress}`);
    }

    const aesKey = await deriveSharedKey(
      encryptionKey.replace(/^0x/, ""),
      uploaderPublicKey.replace(/^0x/, "")
    );

    const unpacked = unpackEncrypted(seed);
    const decrypted = await decryptAES(
      unpacked.encrypted,
      aesKey,
      unpacked.iv,
      unpacked.authTag
    );

    return decrypted;
  }

  get encrypt() {
    return encryptAES;
  }

  get decrypt() {
    return decryptAES;
  }
}

export default Contracts;

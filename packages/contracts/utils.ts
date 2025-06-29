import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { encodePacked, toHex } from "viem";
import { getSharedSecret } from "@noble/secp256k1";

export function extractPrivateKeyFromSignature(
  signature: `0x${string}`
): `0x${string}` {
  const signatureWithoutPrefix = signature.slice(2);

  let privateKey = signatureWithoutPrefix.slice(0, 64);
  if (privateKey.length < 64) {
    privateKey = privateKey.padStart(64, "0");
  }

  return `0x${privateKey}`;
}
export function deriveAESKey(privateKeyHex: string): Buffer {
  return createHash("sha256")
    .update(Buffer.from(privateKeyHex, "hex"))
    .digest(); // 32 bytes for AES-256
}

export function encryptAES(
  message: string,
  aesKey: Buffer
): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", aesKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(message, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return { encrypted, iv, authTag };
}

export function decryptAES(
  encrypted: Buffer,
  aesKey: Buffer,
  iv: Buffer,
  authTag: Buffer
): string {
  const decipher = createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function packEncrypted(
  encrypted: Buffer,
  iv: Buffer,
  authTag: Buffer
): `0x${string}` {
  const prefix = Buffer.alloc(4);
  prefix.writeUInt16BE(encrypted.length, 0);
  prefix.writeUInt8(iv.length, 2);
  prefix.writeUInt8(authTag.length, 3);

  return encodePacked(
    [
      "bytes", // prefix
      "bytes", // encrypted
      "bytes", // iv
      "bytes", // authTag
    ],
    [toHex(prefix), toHex(encrypted), toHex(iv), toHex(authTag)]
  );
}

export function unpackEncrypted(packedHex: `0x${string}`) {
  const packed = Buffer.from(packedHex.slice(2), "hex");

  const lenEncrypted = packed.readUInt16BE(0);
  const lenIv = packed.readUInt8(2);
  const lenTag = packed.readUInt8(3);

  const encrypted = packed.slice(4, 4 + lenEncrypted);
  const iv = packed.slice(4 + lenEncrypted, 4 + lenEncrypted + lenIv);
  const authTag = packed.slice(
    4 + lenEncrypted + lenIv,
    4 + lenEncrypted + lenIv + lenTag
  );

  return { encrypted, iv, authTag };
}

export function deriveSharedKey(
  myPrivateKeyHex: string,
  theirPublicKeyHex: string
): Buffer {
  const sharedSecret = getSharedSecret(
    myPrivateKeyHex,
    theirPublicKeyHex,
    true
  );

  const rawShared = sharedSecret.slice(1);

  return createHash("sha256").update(rawShared).digest();
}

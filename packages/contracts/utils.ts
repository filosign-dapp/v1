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

export async function deriveAESKey(privateKeyHex: string): Promise<Uint8Array> {
  const privateKeyBytes = new Uint8Array(
    privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", privateKeyBytes);
  return new Uint8Array(hashBuffer);
}

export async function encryptAES(
  message: string,
  aesKey: Uint8Array
): Promise<{ encrypted: Uint8Array; iv: Uint8Array; authTag: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    aesKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const messageBytes = new TextEncoder().encode(message);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    messageBytes
  );

  // For AES-GCM, the auth tag is included in the encrypted result
  // We need to separate it (last 16 bytes)
  const encrypted = new Uint8Array(encryptedBuffer);
  const ciphertext = encrypted.slice(0, -16);
  const authTag = encrypted.slice(-16);

  return { encrypted: ciphertext, iv, authTag };
}

export async function decryptAES(
  encrypted: Uint8Array,
  aesKey: Uint8Array,
  iv: Uint8Array,
  authTag: Uint8Array
): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    aesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // Combine ciphertext and auth tag for AES-GCM
  const encryptedWithTag = new Uint8Array(encrypted.length + authTag.length);
  encryptedWithTag.set(encrypted);
  encryptedWithTag.set(authTag, encrypted.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedWithTag
  );

  return new TextDecoder().decode(decryptedBuffer);
}

export function packEncrypted(
  encrypted: Uint8Array,
  iv: Uint8Array,
  authTag: Uint8Array
): `0x${string}` {
  const prefix = new Uint8Array(4);
  const view = new DataView(prefix.buffer);
  view.setUint16(0, encrypted.length, false); // big endian
  view.setUint8(2, iv.length);
  view.setUint8(3, authTag.length);

  return encodePacked(
    [
      "bytes", // prefix
      "bytes", // encrypted
      "bytes", // iv
      "bytes", // authTag
    ],
    [
      toHex(prefix),
      toHex(encrypted),
      toHex(iv),
      toHex(authTag)
    ]
  );
}

export function unpackEncrypted(packedHex: `0x${string}`) {
  const packed = new Uint8Array(
    packedHex.slice(2).match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const view = new DataView(packed.buffer);
  const lenEncrypted = view.getUint16(0, false); // big endian
  const lenIv = view.getUint8(2);
  const lenTag = view.getUint8(3);

  const encrypted = packed.slice(4, 4 + lenEncrypted);
  const iv = packed.slice(4 + lenEncrypted, 4 + lenEncrypted + lenIv);
  const authTag = packed.slice(
    4 + lenEncrypted + lenIv,
    4 + lenEncrypted + lenIv + lenTag
  );

  return { encrypted, iv, authTag };
}

export async function deriveSharedKey(
  myPrivateKeyHex: string,
  theirPublicKeyHex: string
): Promise<Uint8Array> {
  const sharedSecret = getSharedSecret(
    myPrivateKeyHex,
    theirPublicKeyHex,
    true
  );

  const rawShared = sharedSecret.slice(1);
  const hashBuffer = await crypto.subtle.digest("SHA-256", rawShared);
  
  return new Uint8Array(hashBuffer);
}

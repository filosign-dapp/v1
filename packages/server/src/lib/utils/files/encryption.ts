import { logger } from "../utils";

// Converts ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(new Blob([buffer]));
  });
}

// Converts Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    resolve(bytes.buffer);
  });
}

export async function encryptFile(buffer: ArrayBuffer, secretKey?: string) {
  logger('Encrypting file...');
  const initTime = new Date().toISOString();

  let key: CryptoKey;
  let rawKey: ArrayBuffer;
  let iv: Uint8Array<ArrayBuffer>;

  if (secretKey) {
    logger('Using provided secret key for encryption');
    const [keyB64, ivB64] = secretKey.split(':');
    rawKey = await base64ToArrayBuffer(keyB64);
    iv = new Uint8Array(await base64ToArrayBuffer(ivB64));
    key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  } else {
    key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    rawKey = await crypto.subtle.exportKey('raw', key);
    iv = crypto.getRandomValues(new Uint8Array(12));
  }

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    buffer
  );

  const encodedKey = await arrayBufferToBase64(rawKey);
  const encodedIV = await arrayBufferToBase64(iv.buffer);
  const keyIvString = `${encodedKey}:${encodedIV}`;

  const endTime = new Date().toISOString();
  const timeTaken = new Date(endTime).getTime() - new Date(initTime).getTime();
  logger('Finished encrypting file...', { timeTaken: `${timeTaken}ms` });
  return {
    encryptedBuffer,
    secretKey: keyIvString
  };
}

export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  secretKey: string,
) {
  logger('Decrypting file...');
  const initTime = new Date().toISOString();
  const [keyB64, ivB64] = secretKey.split(':');
  const rawKey = await base64ToArrayBuffer(keyB64);
  const iv = new Uint8Array(await base64ToArrayBuffer(ivB64));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encryptedBuffer
  );

  const endTime = new Date().toISOString();
  const timeTaken = new Date(endTime).getTime() - new Date(initTime).getTime();
  logger('Finished decrypting file...', { timeTaken: `${timeTaken}ms` });
  return decryptedBuffer;
}
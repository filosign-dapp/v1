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

export async function encryptFile(file: File) {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  const rawKey = await crypto.subtle.exportKey('raw', key);

  const encodedKey = await arrayBufferToBase64(rawKey);
  const encodedIV = await arrayBufferToBase64(iv.buffer);
  const keyIvString = `${encodedKey}:${encodedIV}`;

  return {
    encryptedBuffer,
    secretKey: keyIvString
  };
}

export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  secretKey: string,
  name: string,
  type: string
) {
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

  return new File([decryptedBuffer], name, { type });
}
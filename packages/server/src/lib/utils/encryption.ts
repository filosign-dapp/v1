// Converts ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Converts Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptFile(file: File) {

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
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

  const encodedKey = arrayBufferToBase64(rawKey);
  const encodedIV = arrayBufferToBase64(iv.buffer);
  const keyIvString = `${encodedKey}:${encodedIV}`;

  return {
    encryptedBuffer,
    secretKey: keyIvString
  };
}

export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  encodedKey: string
): Promise<ArrayBuffer> {

  const [keyB64, ivB64] = encodedKey.split(':');
  const rawKey = base64ToArrayBuffer(keyB64);
  const iv = new Uint8Array(base64ToArrayBuffer(ivB64));

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

  return decryptedBuffer;
}


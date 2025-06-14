
 // Converts Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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

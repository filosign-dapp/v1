// Converts ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
    encodedKey: keyIvString
  };
}

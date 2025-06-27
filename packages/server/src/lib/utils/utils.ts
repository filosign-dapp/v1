import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, length: number = 20) {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

export function truncateAddress(address: string, length: number = 4) {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function logger(message: string, data?: object) {
  if (process.env.BUN_PUBLIC_LOGGER === 'true') {
    console.log(message, data ? data : '');
  }
}

export function extractPrivateKeyFromSignature(signature: `0x${string}`): `0x${string}` {
  // remove 0x prefix
  const signatureWithoutPrefix = signature.slice(2);

  // slice or pad based on length
  let privateKey = signatureWithoutPrefix.slice(0, 64);
  if (privateKey.length < 64) {
    privateKey = privateKey.padStart(64, "0");
  }

  // add 0x prefix
  return `0x${privateKey}`;
}
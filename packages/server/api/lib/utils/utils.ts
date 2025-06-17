import { getW3UpClient } from "./w3up-client";

export function generateHash(data: string): string {
  return new Bun.CryptoHasher("sha3-256").update(data).digest("hex");
}

// Flush old CIDs which are older than maxAge (default 7 days)

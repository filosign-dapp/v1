import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  decryptAES,
  deriveSharedKey,
  encryptAES,
  packEncrypted,
  unpackEncrypted,
} from "./utils";

const msg = "Hello World hi how are you i am alien";

const ApvtKey = generatePrivateKey();
const A = {
  pvt: ApvtKey,
  pub: privateKeyToAccount(ApvtKey).publicKey,
};

const BpvtKey = generatePrivateKey();
const B = {
  pvt: BpvtKey,
  pub: privateKeyToAccount(BpvtKey).publicKey,
};

const aesKey = deriveSharedKey(
  A.pvt.replace("0x", ""),
  B.pub.replace("0x", "")
);

const { encrypted, iv, authTag } = encryptAES(msg, aesKey);
const seed = packEncrypted(encrypted, iv, authTag);

console.log("Seed : ", seed);

const unpacked = unpackEncrypted(seed);

const aesDecryptionKey = deriveSharedKey(
  B.pvt.replace("0x", ""),
  A.pub.replace("0x", "")
);

const decrypted = decryptAES(
  unpacked.encrypted,
  aesDecryptionKey,
  unpacked.iv,
  unpacked.authTag
);

console.log("Decrypted:", decrypted);

console.log("Did it work? ", decrypted === msg ? "Yes" : "No");

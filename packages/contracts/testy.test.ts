import { expect, test } from "bun:test";
import { randomBytes } from "crypto";
import * as viem from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { filecoinCalibration } from "viem/chains";

const key = `0x${randomBytes(32).toString("hex")}` as const;

const wallet = viem
  .createWalletClient({
    transport: viem.http(filecoinCalibration.rpcUrls.default.http[0]),
    account: privateKeyToAccount(key),
    chain: filecoinCalibration,
  })
  .extend(viem.publicActions);

fetch(
  "https://forest-explorer.chainsafe.dev/api/signed_fil_transfer6026995707456515920"
);

test("register", async () => {});

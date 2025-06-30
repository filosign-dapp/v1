import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    "filecoin-calibration-testnet": {
      url: "https://api.calibration.node.glif.io/rpc/v1",
    },
  },
  etherscan: {
    apiKey: {
      "filecoin-calibration-testnet": "empty",
    },
    customChains: [
      {
        network: "filecoin-calibration-testnet",
        chainId: 314159,
        urls: {
          apiURL: "https://filecoin-testnet.blockscout.com/api",
          browserURL: "https://filecoin-testnet.blockscout.com",
        },
      },
    ],
  },
};

export default config;

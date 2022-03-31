import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@primitivefi/hardhat-dodoc";
import "hardhat-spdx-license-identifier";
import "hardhat-contract-sizer";
import { HardhatUserConfig } from "hardhat/types";
import { NetworkUserConfig } from "hardhat/types";
import "@typechain/hardhat";

const chainIds = {
  edge: 100,
  mumbai: 80001,
};

const MNEMONIC = process.env.MNEMONIC || "";

function createTestnetConfig(
  network: keyof typeof chainIds,
  url: string
): NetworkUserConfig {
  return {
    accounts: {
      count: 20,
      initialIndex: 0,
      mnemonic: MNEMONIC,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
  };
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    matic: createTestnetConfig("mumbai", process.env.MATIC_TESTNET || ""),

    edge: createTestnetConfig("edge", "http://localhost:10002"),
  },
  mocha: {
    timeout: 100000,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    coinmarketcap: process.env.CMC_KEY,
    token: "MATIC",
    outputFile: "gasReport",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  dodoc: {
    runOnCompile: true,
    testMode: false,
    include: ["Signature", "WhiteList", "ERC1155Token"],
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;

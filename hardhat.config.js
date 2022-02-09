require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@primitivefi/hardhat-dodoc");
require("hardhat-spdx-license-identifier");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const NODES = [
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
  "https://data-seed-prebsc-2-s1.binance.org:8545/",
  "https://data-seed-prebsc-2-s2.binance.org:8545/",
  "https://data-seed-prebsc-1-s3.binance.org:8545/",
  "https://data-seed-prebsc-2-s3.binance.org:8545/",
];

const rnd = Math.floor(Math.random() * NODES.length);
const rpc_node = NODES[rnd];

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URI !== undefined ? process.env.ROPSTEN_URI : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: process.env.RINKEBY_URI !== undefined ? process.env.RINKEBY_URI : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      network_id: 4,
      confirmations: 2,
      timeoutBlocks: 100,
      skipDryRun: true,
      networkCheckTimeout: 360000,
    },
    goerli: {
      url: process.env.GOERLI_URI !== undefined ? process.env.GOERLI_URI : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      network_id: 5,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 360000,
    },
    eth: {
      url:
        process.env.ETH_MAINNET_URI !== undefined
          ? process.env.ETH_MAINNET_URI
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      network_id: 1,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 360000,
    },
    bsc_testnet: {
      url: `${rpc_node}`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      network_id: 97,
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 360000,
    },
    bsc: {
      url:
        process.env.BSC_MAINNET_URI !== undefined
          ? process.env.BSC_MAINNET_URI
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      network_id: 56,
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 360000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  dodoc: {
    runOnCompile: true,
    testMode: false,
    include: ["ERC20Token", "ERC721Token", "ERC1155Token"],
    // More options...
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
};

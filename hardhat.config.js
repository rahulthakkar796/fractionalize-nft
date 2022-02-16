require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@primitivefi/hardhat-dodoc");
require("hardhat-spdx-license-identifier");
require("hardhat-contract-sizer");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {},
  gasReporter: {
    enabled: true,
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
    include: ["ERC20Token", "ERC721Token", "ERC1155Token"],
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
};

const ethers = require("ethers");

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "FRACTION_GASLESS";
const SIGNING_DOMAIN_VERSION = "1";

// /**
//  * JSDoc typedefs.
//  *
//  * @typedef {object} AdditionalMint
//  * @property {ethers.Bytes | string} to address to mint tokens to
//  * @property {ethers.BigNumber | number} id NFT ID
//  * @property {ethers.BigNumber | number} amount amount of tokens you want to mint
//  */

/**
 * AdditionalMint is a helper class that creates AdditionalMint objects and signs them, to be passed as a parameter to mintTokens contract function to mint additional tokens without paying for the gas.
 */
class AdditionalMint {
  /**
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to sign the permit signature
   */
  constructor(contract, signer) {
    this.contract = contract;
    this.signer = signer;
  }

  /**
   * Creates a new Permit object and signs it using this signers's signing key.
   *
   * @param {ethers.Bytes | string} to address to mint tokens to
   * @param {ethers.BigNumber | number} id NFT ID
   * @param {ethers.BigNumber | number} amount amount of tokens you want to mint
   *
   * @returns {AdditionalMint}
   */
  async createSignature(to, id, amount) {
    const message = { to, id, amount };
    const domain = await this._signingDomain();
    const types = {
      AdditionalMint: [
        { name: "to", type: "address" },
        { name: "id", type: "uint256" },
        { name: "amount", type: "uint256" },
      ],
    };
    const signature = await this.signer._signTypedData(domain, types, message);
    return {
      ...message,
      signature,
    };
  }

  /**
   * @private
   * @returns {object} the EIP-721 signing domain, tied to the chainId of the signer
   */
  async _signingDomain() {
    if (this._domain != null) {
      return this._domain;
    }
    const chainId = parseInt(await this.contract.getChainID());
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
    return this._domain;
  }
}

module.exports = {
  AdditionalMint,
};

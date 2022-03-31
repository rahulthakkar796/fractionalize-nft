import { ERC1155Token } from "../typechain";
import { Domain, NFTMint as NFT } from "../interfaces";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "FRACTION_GASLESS";
const SIGNING_DOMAIN_VERSION = "1";

// /**
//  * JSDoc typedefs.
//  *
//  * @typedef {object} NFTMint
//  * @property {ethers.Bytes | string} owner whitelisted issuer address that has signed this message and want to mint a NFT
//  * @property {string} deedNo deed number of the asset
//  * @property {string} assetID assest ID of the asset
//  * @property {string} issuerID issuer ID of the asset
//  * @property {string} projectID project ID of the asset
//  * @property {ethers.BigNumber | number} totalSupply initial total supply of the fractions of the NFT.
//  * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTMint, apart from signature itself.
//  */

/**
 * NFTMint is a helper class that creates NFTMint objects and signs them, to be passed as a parameter to createTokens contract function to mint the NFT.
 */
class NFTMint {
  contract: ERC1155Token;
  signer: SignerWithAddress;
  _domain: Domain | undefined;
  /**
   *
   * @param {Object} options
   * @param {ERC1155Token} contract an ethers Contract that's wired up to the deployed contract
   * @param {SignerWithAddress} signer a Signer whose account is whitelisted to mint NFTs on the deployed contract
   */

  constructor(contract: ERC1155Token, signer: SignerWithAddress) {
    this.contract = contract;
    this.signer = signer;
  }

  /**
   * Creates a new NFTMint object and signs it using this signer's signing key.
   *
   * @param {ethers.Bytes | string} owner whitelisted issuer address that has signed this message and want to mint a NFT
   * @param {string} deedNo deed number of the asset
   * @param {string} assetID assest ID of the asset
   * @param {string} issuerID issuer ID of the asset
   * @param {string} projectID project ID of the asset
   * @param {ethers.BigNumber | number} totalSupply initial total supply of the fractions of the NFT.
   *
   * @returns {NFT}
   */
  async createSignature(nftMint: NFT): Promise<NFT> {
    const message = nftMint;
    const domain = await this._signingDomain();
    const types = {
      NFTMint: [
        { name: "issuer", type: "address" },
        { name: "deedNo", type: "string" },
        { name: "assetID", type: "string" },
        { name: "issuerID", type: "string" },
        { name: "projectID", type: "string" },
        { name: "totalSupply", type: "uint256" },
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
   * @returns {Domain} the EIP-721 signing domain, tied to the chainId of the signer
   */
  async _signingDomain(): Promise<Domain> {
    if (this._domain != null) {
      return this._domain;
    }
    const chainId = parseInt((await this.contract.getChainID()).toString());
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
    return this._domain;
  }
}

export { NFTMint };

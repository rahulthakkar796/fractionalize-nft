// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "FRACTION_GASLESS";
const SIGNING_DOMAIN_VERSION = "1";
import { ERC1155Token } from "../typechain";
import { Permit } from "../interfaces";
import { Domain } from "../interfaces";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// /**
//  * JSDoc typedefs.
//  *
//  * @typedef {object} Permit
//  * @property {ethers.Bytes | string} owner address of the NFT owner
//  * @property {ethers.Bytes | string} spender address that will get access to transfer tokens on behalf of the owner
//  * @property {boolean} approved boolean value to grant / revoke approve permit from the given spender
//  * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the Permit, apart from signature itself.
//  */

/**
 * Approval is a helper class that creates Permit objects and signs them, to be passed as a parameter to permit contract function and approve the spender address.
 */
class Approval {
  contract: ERC1155Token;
  signer: SignerWithAddress;
  _domain: Domain | undefined;
  /**
   * @param {ERC1155Token} contract an ethers Contract that's wired up to the deployed contract
   * @param {SignerWithAddress} signer a Signer whose account is authorized to sign the permit signature
   */
  constructor(contract: ERC1155Token, signer: SignerWithAddress) {
    this.contract = contract;
    this.signer = signer;
  }

  /**
   * Creates a new Permit object and signs it using this signers's signing key.
   *
   * @param {ethers.Bytes | string} owner address of the NFT owner
   * @param {ethers.Bytes | string} spender address that will get access to transfer tokens on behalf of the owner
   * @param {boolean} approved bool value to grant / revoke approve permit from the given spender
   *
   * @returns {Permit}
   */
  async createSignature(permit: Permit): Promise<Permit> {
    let message = permit;
    const domain = await this._signingDomain();
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "approved", type: "bool" },
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

export { Approval };

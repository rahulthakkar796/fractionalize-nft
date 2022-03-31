import { BytesLike } from "ethers";

export interface Permit {
  owner: string;
  spender: string;
  approved: boolean;
  signature: BytesLike;
}

export interface Domain {
  name: string;
  version: string;
  verifyingContract: string;
  chainId: number;
}

export interface NFTMint extends Metadata {
  issuer: string;
  totalSupply: number;
  signature: BytesLike;
}

export interface AdditionalMint {
  to: string;
  id: number;
  amount: number;
  signature: BytesLike;
}

export interface Metadata {
  deedNo: string;
  assetID: string;
  issuerID: string;
  projectID: string;
}

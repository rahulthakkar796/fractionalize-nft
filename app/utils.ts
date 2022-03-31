import { Metadata } from "./interfaces";
import Prompt from "prompt-sync";
import { ethers, hardhatArguments } from "hardhat";

// detect current network to run the dynamic tests, might be useful when using testnet
let network =
  hardhatArguments.network === undefined ? "hardhat" : hardhatArguments.network;

/**
 * @notice generates `length` number of accounts to test the batch/bulk transfer
 * @param length number of accounts you want to generate
 * @param id id of the NFT you want to transfer to test the bulk transfer(applies to ERC1155 approach only)
 * @param amount amount of tokens you want to transfer per transfer
 */
async function generateAccounts(
  length: number,
  id: number,
  amount: number
): Promise<{
  from: string[];
  to: string[];
  id: number[];
  amounts: number[];
}> {
  const accounts = await ethers.getSigners();
  let from = [accounts[0].address, accounts[2].address, accounts[3].address];
  let to = [accounts[4].address, accounts[5].address];
  let fromAccs = [];
  let toAccs = [];
  let idArr = [];
  let amountArr = [];

  while (fromAccs.length < length) {
    let fromVal = from[Math.floor(Math.random() * 3)];
    let toVal = to[Math.floor(Math.random() * 2)];
    fromAccs.push(fromVal);
    toAccs.push(toVal);
    idArr.push(id);
    amountArr.push(amount);
  }

  return { from: fromAccs, to: toAccs, id: idArr, amounts: amountArr };
}

// generate random strings for the metadata
const metadata: Metadata = {
  deedNo: (0 | (Math.random() * 9e7)).toString(36),
  assetID: (0 | (Math.random() * 9e7)).toString(36),
  issuerID: (0 | (Math.random() * 9e7)).toString(36),
  projectID: (0 | (Math.random() * 9e7)).toString(36),
};

const prompt = Prompt();

export { network, generateAccounts, metadata, prompt };

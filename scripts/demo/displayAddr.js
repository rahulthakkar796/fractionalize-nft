/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const prompt = require("prompt-sync")();

async function main() {
  const signers = await ethers.getSigners();
  for (let i = 0; i < signers.length; i++) {
    console.log(`${i}: ${signers[i].address}`);
  }
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n");
  const owner = prompt(
    "choose fraction owner address from the list (Value from 0 to 9) : "
  );
  console.log("\n");
  const issuer = prompt(
    "choose NFT issuer address from the list (Value from 0 to 9) : "
  );
  console.log("\nOwner address : ", signers[owner].address);
  console.log("\nIssuer address : ", signers[issuer].address);

  const balanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(signers[issuer].address)
  );
  const OwnerBalancebefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(signers[owner].address)
  );

  console.log(
    `\nowner address(${signers[owner].address}) balance : ${OwnerBalancebefore}`
  );
  console.log(
    `\nissuer address(${signers[issuer].address}) balance : ${balanceBefore}`
  );

  console.log(
    "\n *****************************************************************************************************************"
  );

  return { owner: signers[owner], issuer: signers[issuer] };
}

module.exports.displayAddr = main;

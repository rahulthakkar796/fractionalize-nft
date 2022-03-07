/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const { NFTMint } = require("../../lib/nftSigner");
const prompt = require("prompt-sync")();

async function main(contract, owner, issuer) {
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n Mint a new NFT");
  console.log(
    "\n *****************************************************************************************************************"
  );

  console.log("\n 1st step: Whitelist issuer address");

  console.log("\n");
  let answer = prompt(
    `Would you like to whitelist issuer(${issuer.address}), press y to continue: `
  );
  if (answer != "y") {
    process.exit(1);
  }
  const whitelistTxn = await contract
    .connect(owner)
    .addToWhitelist(issuer.address);
  let whitelistHash = await whitelistTxn.wait();
  console.log("\n Transaction hash:", whitelistHash.transactionHash);
  console.log("\n Whitelisted successfully!");

  console.log(
    "\n\n 2nd step: Provide metadata to mint and fractionalize the NFT"
  );
  console.log("\n");
  const deedNo = prompt("Enter deed number:");
  console.log("\n");
  const assetID = prompt("Enter asset ID:");
  console.log("\n");
  const issuerID = prompt("Enter issuer ID:");
  console.log("\n");
  const projectID = prompt("Enter project ID:");
  console.log("\n");
  const totalSupply = prompt("Enter total supply to fractionalize NFT:");

  console.log(
    "\n\n 3rd step: sign the message to mint and fractionalize NFT(to enable gasless transaction)"
  );
  console.log("\n");
  answer = prompt(
    "Would you like to sign the message, press 'y' to continue: "
  );
  if (answer != "y") {
    process.exit(1);
  }

  const nft = new NFTMint(contract, issuer);
  const nftSignature = await nft.createSignature(
    issuer.address,
    deedNo,
    assetID,
    issuerID,
    projectID,
    totalSupply
  );

  console.log("\n Signed the message successfully");
  console.log("\n Message along with the signature:", nftSignature);

  console.log(
    `\n\n 4th step: sign the mint transaction using owner address (${owner.address})`
  );
  console.log("\n");
  answer = prompt(
    "Would you like to sign the mint transaction to mint and fractionalize the NFT, press 'y' to continue:"
  );

  if (answer != "y") {
    process.exitCode = 1;
  }
  const balanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );
  const mintTxn = await contract.connect(owner).createToken(nftSignature);
  const mintHash = await mintTxn.wait();
  console.log("\n Transaction hash:", mintHash.transactionHash);
  console.log("\n Minted and Fractionalized token sucessfully!");
  const balanceAfter = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceAfter = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );
  console.log("\n Issuer eth balance before:", balanceBefore);
  console.log("\n Issuer eth balance after:", balanceAfter);
  console.log("\n Owner eth balance before:", OwnerBalanceBefore);

  console.log("\n Owner eth balance after:", OwnerBalanceAfter);
}

module.exports.mintNFT = main;

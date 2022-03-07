/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const { generateAccounts } = require("../../test/utils");
const prompt = require("prompt-sync")();

async function main(contract, owner, issuer) {
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n Batch transfer (One to Many)");
  console.log(
    "\n *****************************************************************************************************************"
  );

  console.log(
    `\n\n 1st step: Select batch size, token id, amount and no of transfers `
  );
  console.log("\n");

  let batchSize = prompt(`Enter batch size(max limit is 400): `);
  console.log("\n");
  while (batchSize > 400) {
    batchSize = prompt(`Enter batch size(max limit is 400): `);
  }
  let _id = prompt(`Enter token id: `);
  console.log("\n");
  let amount = prompt(
    `Enter amount of tokens you want transfer per token transfer: `
  );
  console.log("\n");
  let transfers = prompt(`Enter number of transfers you want to process: `);

  const { to, id, amounts } = await generateAccounts(batchSize, _id, amount);

  const len = transfers / batchSize;
  let totalTime = 0;
  const nftBalanceBefore = parseInt(
    await contract.balanceOf(issuer.address, 0)
  );
  const balanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );
  for (let i = 0; i < len; i++) {
    const { txnTime, txnHash } = await bulkTransfer(
      contract,
      owner,
      [issuer.address],
      to,
      id,
      amounts
    );
    totalTime += txnTime;
    console.log(
      `\n Total transaction time to process batch ${
        i + 1
      } (${batchSize} transfers) : ${parseFloat(txnTime).toFixed(4)}s`
    );
    console.log(`Transaction hash for batch ${i + 1} :${txnHash} `);
  }

  console.log(
    `\n\n Total transaction time to process ${len} batches (${transfers} transfers) : ${parseFloat(
      totalTime
    ).toFixed(4)}s`
  );

  const nftBalanceAfter = parseInt(await contract.balanceOf(issuer.address, 0));
  const balanceAfter = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceAfter = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );
  console.log("\n Issuer eth balance before:", balanceBefore);
  console.log("\n Issuer eth balance after:", balanceAfter);
  console.log(
    "\n Owner eth balance before:",
    parseFloat(OwnerBalanceBefore).toFixed(18)
  );

  console.log(
    "\n Owner eth balance after:",
    parseFloat(OwnerBalanceAfter).toFixed(18)
  );

  console.log("\n Issuer NFT balance before:", nftBalanceBefore);
  console.log("\n Issuer NFT balance after:", nftBalanceAfter);
}

async function bulkTransfer(contract, owner, from, to, id, amounts) {
  const before = Date.now() / 1000;
  // call the bulk transfer method
  const bulkTransfer = await contract
    .connect(owner)
    .safeBulkTransferFrom(from, to, id, amounts, "0x");

  let txn = await bulkTransfer.wait();
  let txnHash = txn.transactionHash;

  const after = Date.now() / 1000;

  return { txnTime: after - before, txnHash };
}

module.exports.bulkTransfer = main;

/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const { Approval } = require("../../lib/approveSigner");
const prompt = require("prompt-sync")();

async function main(contract, owner, issuer) {
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n Permit for batch transfer");
  console.log(
    "\n *****************************************************************************************************************"
  );

  console.log(
    `\n\n 1st step: Approve fraction owner(${owner.address}) to perform the batch transfer on behalf of the issuer(${issuer.address}) `
  );
  console.log("\n");
  let answer = prompt(
    `Would you like to sign the permit message to enable gasless transaction, press y to continue: `
  );
  if (answer != "y") {
    process.exit(1);
  }
  const balanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );
  const permit = new Approval(contract, issuer);
  const permitSignature = await permit.createSignature(
    issuer.address,
    owner.address,
    true
  );

  console.log("\n Signed the message successfully");
  console.log("\n Message along with the signature:", permitSignature);

  console.log(
    `\n\n 2nd step: sign the permit transaction using owner address (${owner.address})`
  );
  console.log("\n");
  answer = prompt(
    `Would you like to sign the permit transaction to approve owner address(${owner.address}), press 'y' to continue: `
  );

  if (answer != "y") {
    process.exitCode = 1;
  }
  const approveTxn = await contract.connect(owner).permit(permitSignature);
  const approveHash = await approveTxn.wait();
  console.log("\n Transaction hash:", approveHash.transactionHash);
  console.log("\n Approved owner address sucessfully!");
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
}

module.exports.permit = main;

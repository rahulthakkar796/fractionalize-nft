const { AdditionalMint } = require("../../lib/additionalMintSigner");

/* eslint-disable no-undef */
const prompt = require("prompt-sync")();

async function main(contract, owner, issuer) {
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n Mint additional tokens");
  console.log(
    "\n *****************************************************************************************************************"
  );

  console.log("\n");
  let answer = prompt(
    `Would you like to mint additional tokens?, press y to continue: `
  );
  if (answer != "y") {
    process.exit(1);
  }
  console.log("\n\n 1st step: Provide given details");
  console.log("\n");
  const user = prompt("Enter the address you want to mint tokens to : ");
  console.log("\n");
  const id = prompt("Enter token id : ");
  console.log("\n");
  const amount = prompt("Enter amount of tokens you want to mint : ");

  console.log(
    "\n\n 3rd step: sign the message(Includes the details you have entered above) to mint additional tokens)"
  );
  console.log("\n");
  answer = prompt(
    "Would you like to sign the message, press 'y' to continue: "
  );
  if (answer != "y") {
    process.exit(1);
  }

  const mintSigner = new AdditionalMint(contract, issuer);
  const mintSignature = await mintSigner.createSignature(user, id, amount);

  console.log("\n Signed the message successfully");
  console.log("\n Message along with the signature:", mintSignature);

  console.log(
    `\n\n 4th step: sign the mint transaction using owner address (${owner.address})`
  );
  console.log("\n");
  answer = prompt(
    "Would you like to sign the mint transaction to mint additional tokens, press 'y' to continue:"
  );

  if (answer != "y") {
    process.exitCode = 1;
  }

  const supplyBefore = parseInt(await contract.totalSupply(0));
  const nftBalanceBefore = parseInt(await contract.balanceOf(user, id));
  const balanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );

  const mintTxn = await contract.connect(owner).mintTokens(mintSignature);
  const mintHash = await mintTxn.wait();

  const supplyAfter = parseInt(await contract.totalSupply(0));
  const nftBalanceAfter = parseInt(await contract.balanceOf(user, id));
  const balanceAfter = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuer.address)
  );
  const OwnerBalanceAfter = ethers.utils.formatEther(
    await ethers.provider.getBalance(owner.address)
  );

  console.log("\nMinted tokens successfully!");
  console.log("\nTransaction hash : ", mintHash.transactionHash);
  console.log(`\nTotal supply of token id ${id} before mint : ${supplyBefore}`);
  console.log(`\nTotal supply of token id ${id} after mint : ${supplyAfter}`);
  console.log(
    `\nToken balance of user(${user}) before mint : ${nftBalanceBefore}`
  );
  console.log(
    `\nToken balance of user(${user}) after mint : ${nftBalanceAfter}`
  );
  console.log("\n Issuer eth balance before:", balanceBefore);
  console.log("\n Issuer eth balance after:", balanceAfter);
  console.log("\n Owner eth balance before:", OwnerBalanceBefore);
  console.log("\n Owner eth balance after:", OwnerBalanceAfter);
  console.log("\n");
}

module.exports.additionalMint = main;

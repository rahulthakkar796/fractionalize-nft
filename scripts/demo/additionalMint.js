/* eslint-disable no-undef */
const prompt = require("prompt-sync")();

async function main(contract, issuer) {
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
  console.log("\n");
  const user = prompt("Enter the address you want to mint tokens to : ");
  console.log("\n");
  const id = prompt("Enter token id : ");
  console.log("\n");
  const amount = prompt("Enter amount of tokens you want to mint : ");
  const supplyBefore = parseInt(await contract.totalSupply(0));
  const balanceBefore = parseInt(await contract.balanceOf(user, id));

  const mintTxn = await contract.connect(issuer).mintTokens(user, id, amount);
  const mintHash = await mintTxn.wait();

  const supplyAfter = parseInt(await contract.totalSupply(0));
  const balanceAfter = parseInt(await contract.balanceOf(user, id));

  console.log("\nMinted tokens successfully!");
  console.log("\nTransaction hash : ", mintHash.transactionHash);

  console.log(`\nTotal supply of token id ${id} before mint : ${supplyBefore}`);

  console.log(`\nTotal supply of token id ${id} after mint : ${supplyAfter}`);

  console.log(
    `\nToken balance of user(${user}) before mint : ${balanceBefore}`
  );

  console.log(`\nToken balance of user(${user}) after mint : ${balanceAfter}`);
  console.log("\n");
}

module.exports.additionalMint = main;

/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const prompt = require("prompt-sync")();
const { displayAddr } = require("./displayAddr");

async function main() {
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n Contract deployment");
  console.log(
    "\n *****************************************************************************************************************"
  );
  console.log("\n");
  const { owner, issuer } = await displayAddr();
  console.log("\n\nERC1155 deployment");
  console.log("\n");
  const defaultURI = "data:application/json;base64,";
  let baseURI = prompt(`Enter base URI (default:'${defaultURI}') : `);
  baseURI = baseURI == "" ? defaultURI : baseURI;
  const ERC1155Contract = await ethers.getContractFactory("ERC1155Token");
  const ERC1155 = await ERC1155Contract.connect(owner).deploy(baseURI);
  console.log("\n ERC1155 deployed at : ", ERC1155.address);
  console.log("\n Transaction hash:", ERC1155.deployTransaction.hash);
  return { contract: ERC1155, owner, issuer };
}

module.exports.deploy = main;

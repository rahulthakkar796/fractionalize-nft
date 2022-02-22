/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const prompt = require("prompt-sync")();

async function main() {
  console.group();
  console.log("ERC721+ERC20 deployment");
  const name = prompt("Enter ERC721 token name:");
  const symbol = prompt("Enter ERC721 token symbol:");
  const ERC721Contract = await ethers.getContractFactory("ERC721Token");
  const ERC721 = await ERC721Contract.deploy(name, symbol);
  console.log("\n ERC721 deployed at : ", ERC721.address);
  console.log("\n Transaction hash:", ERC721.deployTransaction.hash);
  console.groupEnd();

  console.group();
  console.log("\n \n ERC1155 deplpyment");
  const defaultURI = "data:application/json;base64,";
  let baseURI = prompt(`Enter base URI (default:'${defaultURI}') : `);
  baseURI = baseURI == "" ? defaultURI : baseURI;
  const ERC1155Contract = await ethers.getContractFactory("ERC1155Token");
  const ERC1155 = await ERC1155Contract.deploy(baseURI);
  console.log("\n ERC1155 deployed at : ", ERC1155.address);
  console.log("\n Transaction hash:", ERC1155.deployTransaction.hash);
  console.groupEnd();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports.deploy = main;

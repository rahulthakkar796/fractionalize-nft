/* eslint-disable no-undef */
const { ethers } = require("hardhat");

async function main() {
  const name = "Fraction Asset Registry";
  const symbol = "FAR";
  const ERC721Contract = await ethers.getContractFactory("ERC721Token");
  const ERC721 = await ERC721Contract.deploy(name, symbol);
  console.log("ERC721 deployed at : ", ERC721.address);

  const baseURI = "data:application/json;base64,";
  const ERC1155Contract = await ethers.getContractFactory("ERC1155Token");
  const ERC1155 = await ERC1155Contract.deploy(baseURI);
  console.log("ERC1155 deployed at : ", ERC1155.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

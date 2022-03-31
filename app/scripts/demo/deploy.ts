/* eslint-disable no-undef */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC1155Token, ERC1155Token__factory } from "../../typechain";
import { prompt } from "../../utils";
import { displayAddr } from "./displayAddr";

async function main(): Promise<{
  contract: ERC1155Token;
  owner: SignerWithAddress;
  issuer: SignerWithAddress;
}> {
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
  const NFTFactory = new ERC1155Token__factory(owner);
  const ERC1155 = await NFTFactory.deploy(baseURI);
  console.log("\n ERC1155 deployed at : ", ERC1155.address);
  console.log("\n Transaction hash:", ERC1155.deployTransaction.hash);
  return { contract: ERC1155, owner, issuer };
}

export { main as deploy };

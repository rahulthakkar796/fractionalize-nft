/* eslint-disable no-undef */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { prompt } from "../../utils";

async function main(): Promise<{
  owner: SignerWithAddress;
  issuer: SignerWithAddress;
}> {
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
  const ownerSigner = signers[parseInt(owner)];
  const issuerSigner = signers[parseInt(issuer)];
  console.log("\nOwner address : ", ownerSigner.address);
  console.log("\nIssuer address : ", issuerSigner.address);

  const balanceBefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(issuerSigner.address)
  );
  const OwnerBalancebefore = ethers.utils.formatEther(
    await ethers.provider.getBalance(ownerSigner.address)
  );

  console.log(
    `\nowner address(${ownerSigner.address}) balance : ${OwnerBalancebefore}`
  );
  console.log(
    `\nissuer address(${issuerSigner.address}) balance : ${balanceBefore}`
  );

  console.log(
    "\n *****************************************************************************************************************"
  );

  return { owner: ownerSigner, issuer: issuerSigner };
}

export { main as displayAddr };

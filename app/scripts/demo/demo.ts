import { permit } from "./permit";
import { deploy } from "./deploy";
import { mintNFT } from "./mintNFT";
import { bulkTransfer } from "./bulkTransfer";
import { additionalMint } from "./additionalMint";

async function main(): Promise<void> {
  try {
    const { contract, owner, issuer } = await deploy();
    await mintNFT(contract, owner, issuer);
    await permit(contract, owner, issuer);
    await bulkTransfer(contract, owner, issuer);
    await additionalMint(contract, owner, issuer);
  } catch (err) {
    console.log("Error:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

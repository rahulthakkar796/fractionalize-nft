const { permit } = require("./permit.js");
const { deploy } = require("./deploy.js");
const { mintNFT } = require("./mintNFT");
const { bulkTransfer } = require("./bulkTransfer.js");
const { additionalMint } = require("./additionalMint.js");

async function main() {
  const { contract, owner, issuer } = await deploy();
  await mintNFT(contract, owner, issuer);
  await permit(contract, owner, issuer);
  await bulkTransfer(contract, owner, issuer);
  await additionalMint(contract, issuer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

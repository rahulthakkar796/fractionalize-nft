const { expect } = require("chai");
const { ethers } = require("hardhat");
const { metadata, generateAccounts } = require("../utils");
const { Approval } = require("../../lib/approveSigner");
const { NFTMint } = require("../../lib/nftSigner");
const { AdditionalMint } = require("../../lib/additionalMintSigner");
describe("Tests for ERC1155 approach", async function () {
  let nftContract;
  let accounts;
  let totalTime;
  let owner;

  before(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    const NFT = await ethers.getContractFactory("ERC1155Token");
    nftContract = await NFT.deploy("data:application/json;base64,");
    const txn = await nftContract.addToWhitelist(accounts[1].address);
    await txn.wait();
  });

  beforeEach(() => {
    totalTime = 0;
  });

  //  *** helper functions ***

  // function to transfer fractionalized tokens to test accounts to test the bulk transfer
  async function transferTokens(account, transferDetails) {
    const balanceBefore = await nftContract.balanceOf(
      account.address,
      transferDetails.id
    );
    const transfer = await nftContract
      .connect(accounts[1])
      .safeTransferFrom(
        accounts[1].address,
        account.address,
        transferDetails.id,
        transferDetails.amount,
        "0x"
      );

    await transfer.wait();

    const balanceAfter = await nftContract.balanceOf(
      account.address,
      transferDetails.id
    );
    expect(balanceAfter).to.be.equal(balanceBefore.add(transferDetails.amount));
  }

  // function to approve fractionalized tokens to test account to test the bulk transfer
  async function setApproval(account) {
    const spender = accounts[6].address;
    const operator = account.address;
    const approval = true;
    const permit = new Approval(nftContract, account);
    const permitSignature = await permit.createSignature(
      operator,
      spender,
      approval
    );

    const approveTxn = await nftContract.connect(owner).permit(permitSignature);

    await approveTxn.wait();

    const isApproved = await nftContract.isApprovedForAll(operator, spender);

    expect(isApproved).to.be.equal(true);
  }

  async function bulkTransfer(from, to, id, amounts) {
    // estimate the gas limit required to process the transaction
    const gas = await nftContract
      .connect(accounts[6])
      .estimateGas.safeBulkTransferFrom(from, to, id, amounts, "0x");
    // console.log("Estimated required gas limit:", gas.toString());

    const before = Date.now() / 1000;
    // call the bulk transfer method
    const bulkTransfer = await nftContract
      .connect(accounts[6])
      .safeBulkTransferFrom(from, to, id, amounts, "0x");

    // listen for the event emitted by the bulk transfer and fetch emitted values to validate the transaction
    let event = await bulkTransfer.wait();

    const after = Date.now() / 1000;

    totalTime += after - before;

    event = event.events.find((event) => event.event === "TransferBulk");
    const [operator, _from, _to, _ids, _amounts] = event.args;

    expect(from.length).to.be.equal(
      _from.length,
      "from array length doesn't match"
    );

    expect(to.length).to.be.equal(_to.length, "to array length doesn't match");

    expect(id.length).to.be.equal(
      _ids.length,
      "ids array length doesn't match"
    );

    expect(amounts.length).to.be.equal(
      _amounts.length,
      "amounts array length doesn't match"
    );
  }

  //Test scenario 1
  describe("Mint and Fractionalize", () => {
    it("Mint NFT and fractionalize it", async () => {
      const params = {
        ...metadata,
        totalSupply: 1000000,
      };
      const nftMint = new NFTMint(nftContract, accounts[1]);
      const nft = await nftMint.createSignature(
        accounts[1].address,
        params.deedNo,
        params.assetID,
        params.issuerID,
        params.projectID,
        params.totalSupply
      );

      // mint NFT and fractionalize it
      const txn = await nftContract.connect(accounts[0]).createToken(nft);
      // listen for the event emitted by the createToken method and fetch emitted values to validate the transaction
      let event = await txn.wait();
      event = event.events.find((event) => event.event === "CreatedNFT");
      const [, owner] = event.args;

      const issuerBalance = await nftContract.balanceOf(accounts[1].address, 0);
      const fractionOwnerBalance = await nftContract.balanceOf(
        accounts[0].address,
        0
      );
      const supply = await nftContract.totalSupply(0);

      expect(owner).to.be.equal(
        accounts[1].address,
        "owner address doesn't match"
      );

      // validate the issuer NFT balance, should be equal to the totalSupply
      expect(params.totalSupply).to.be.equal(
        parseInt(issuerBalance),
        "issuer balance doesn't match"
      );

      // validate the Fraction owner NFT balance, should be always equal to 1
      expect(1).to.be.equal(
        parseInt(fractionOwnerBalance),
        "fraction owner balance doesn't match"
      );

      expect(params.totalSupply + 1).to.be.equal(
        parseInt(supply),
        "totalSupply doesn't match"
      );
    });
  });

  //Test scenario 2
  describe("Batch test(Many-To-Many)", () => {
    it("Test bulk transfer(many-to-many)", async () => {
      const accountArr = [accounts[0], accounts[2], accounts[3]];
      const transferDetails = {
        id: 0,
        amount: 2000,
        data: "0x",
      };

      // transfer tokens and approve tokens before using bulk transfer
      for (let i = 0; i < accountArr.length; i++) {
        await transferTokens(accountArr[i], transferDetails);
        await setApproval(accountArr[i]);
      }

      // generate 280 test accounts to process and test bulk transfer(can process upto 310 transfers per call in local hardhat node)
      // you can process upto 400 transfers using polygon-edge network
      const { from, to, id, amounts } = await generateAccounts(
        310, // number of accounts you want to generate
        0, // token id you want to transfer(used single ID for the testing puropose)
        1 // amount of tokens you want to transfer per transfer(used single value for the testing purpose)
      );

      //perform bulk transfer
      for (let i = 0; i < 5; i++) {
        await bulkTransfer(from, to, id, amounts);
      }
      console.log(
        `Total transaction time to process for ${
          to.length * 5
        } (Many-to-Many) : ${parseFloat(totalTime).toFixed(4)}s`
      );
    });
  });

  // Test scenario 3
  describe("Batch test(One-To-Many)", () => {
    it("Test bulk transfer(one-to-many)", async () => {
      const transferDetails = {
        id: 0,
        amount: 2000,
        data: "0x",
      };

      // transfer tokens and approve tokens before using bulk transfer
      await transferTokens(accounts[0], transferDetails);

      // generate 560 test accounts to process and test bulk transfer(can process upto 560 transfers per call)
      // you can process upto 400 transfers using polygon-edge network
      let { to, id, amounts } = await generateAccounts(
        400, // number of accounts you want to generate
        0, // token id you want to transfer(used single ID for the testing puropose)
        1 // amount of tokens you want to transfer per transfer(used single value for the testing purpose)
      );

      // array of single from address
      let from = [accounts[0].address];

      //perform bulk transfer
      for (let i = 0; i < 5; i++) {
        await bulkTransfer(from, to, id, amounts);
      }
      console.log(
        `Total transaction time to process for ${
          to.length * 5
        } (One-to-Many) : ${parseFloat(totalTime).toFixed(4)}s`
      );
    });
  });

  //Test scenario 4
  describe("Additional mint", () => {
    it("Mint additional tokens", async () => {
      const supplyBefore = await nftContract.totalSupply(0);

      const fractionOwner = accounts[0];
      const issuer = accounts[1];

      const tokenId = 0;
      const amount = 10;
      const to = issuer.address;

      const mintSigner = new AdditionalMint(nftContract, issuer);
      const signedMessage = await mintSigner.createSignature(
        to,
        tokenId,
        amount
      );
        
      // mint fractionalized tokens for the additional supply
      const txn = await nftContract
        .connect(fractionOwner)
        .mintTokens(signedMessage);

      await txn.wait();

      const supplyAfter = await nftContract.totalSupply(0);

      expect(supplyAfter).to.be.equal(supplyBefore.add(10));
    });
  });
});

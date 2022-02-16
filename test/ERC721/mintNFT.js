const { expect } = require("chai");
const { ethers } = require("hardhat");
const { metadata, generateAccounts } = require("../utils");
describe("Tests for ERC721+ERC20 approach", async function () {
  let nftContract;
  let ERC20Contract;
  let accounts;

  before(async () => {
    accounts = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("ERC721Token");
    nftContract = await NFT.deploy("Fraction Asset Registry", "FAR");
    const txn = await nftContract.addToWhitelist(accounts[1].address);
    await txn.wait();
  });

  //  *** helper functions ***

  // function to transfer fractionalized ERC20 tokens to test accounts to test the batch transfer
  async function transferTokens(account, amount) {
    const transfer = await ERC20Contract.connect(accounts[1]).transfer(
      account.address,
      amount
    );

    await transfer.wait();
    const balance = await ERC20Contract.balanceOf(account.address);

    expect(balance).to.be.equal(amount);
  }

  // function to approve fractionalized ERC20 tokens to test account to test the batch transfer
  async function setApproval(account, amount) {
    const approve = await ERC20Contract.connect(account).approve(
      accounts[10].address,
      amount
    );

    await approve.wait();

    const allowance = await ERC20Contract.allowance(
      account.address,
      accounts[10].address
    );
    expect(allowance).to.be.equal(amount);
  }

  //Test scenario 1
  it("Mint NFT and fractionalize it", async () => {
    const params = {
      ...metadata,
      name: "Fraction property hotel",
      symbol: "FPH",
      totalSupply: ethers.utils.parseEther("200000"),
    };

    // mint NFT and fractionalize it using ERC20 token
    const txn = await nftContract
      .connect(accounts[1])
      .createToken(
        params.deedNo,
        params.assetID,
        params.issuerID,
        params.projectID,
        params.name,
        params.symbol,
        params.totalSupply
      );

    // listen for the event emitted by the createToken method and fetch emitted values to validate the transaction
    let event = await txn.wait();
    event = event.events.find((event) => event.event === "CreatedNFT");
    const [, erc20Token, owner] = event.args;

    ERC20Contract = await ethers.getContractAt("ERC20Token", erc20Token);
    const erc20Balance = await ERC20Contract.balanceOf(accounts[1].address);

    expect(owner).to.be.equal(
      accounts[1].address,
      "owner address doesn't match"
    );

    expect(erc20Balance).to.be.equal(
      params.totalSupply,
      "owner balance doesn't match"
    );
  });

  //Test scenario 2
  it("test batch transfer", async () => {
    const amount = ethers.utils.parseEther("4000").toString();
    const accountArr = [accounts[0], accounts[2], accounts[3]];

    // transfer tokens and approve tokens before using batch transfer
    for (let i = 0; i < accountArr.length; i++) {
      await transferTokens(accountArr[i], amount);
      await setApproval(accountArr[i], amount);
    }

    // generate 280 test accounts to process and test batch transfer(can process upto 280 transfers per call)
    const { from, to, id, amounts } = await generateAccounts(
      280, // number of accounts you want to generate
      0, // token id, not needed for ERC20 batchTransfer, pass 0 as a dummy value
      ethers.utils.parseEther("10") // amount of tokens you want to transfer per transfer(used single value for the testing purpose)
    );

    // estimate the gas limit required to process the transaction
    const gas = await ERC20Contract.connect(
      accounts[10]
    ).estimateGas.batchTransferFrom(from, to, amounts);
    console.log("Estimated required gas limit:", gas.toString());

    // call the bulk transfer method
    const batchTransfer = await ERC20Contract.connect(
      accounts[10]
    ).batchTransferFrom(from, to, amounts);

    // listen for the event emitted by the bulk transfer and fetch emitted values to validate the transaction
    let event = await batchTransfer.wait();
    event = event.events.find((event) => event.event === "TransferBatch");
    const [_from, _to, _amounts] = event.args;

    expect(from.length).to.be.equal(
      _from.length,
      "from array length doesn't match"
    );

    expect(to.length).to.be.equal(_to.length, "to array length doesn't match");

    expect(amounts.length).to.be.equal(
      _amounts.length,
      "amounts array length doesn't match"
    );
  });

  //Test scenario 3
  it("Mint additional tokens", async () => {
    const supplyBefore = await ERC20Contract.totalSupply();
    const amount = ethers.utils.parseEther("10").toString();

    // mint fractionalized ERC20 tokens for the additional supply
    await expect(() =>
      ERC20Contract.connect(accounts[1]).mint(accounts[1].address, amount)
    ).to.changeTokenBalance(ERC20Contract, accounts[1], amount);

    const supplyAfter = await ERC20Contract.totalSupply();

    expect(supplyAfter).to.be.equal(
      supplyBefore.add(amount),
      "total supply doesn't match"
    );
  });
});

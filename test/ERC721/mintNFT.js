const { expect } = require("chai");
const { ethers, hardhatArguments } = require("hardhat");

describe("Tests for ERC721+ERC20 approach", async function () {
  let nftContract;
  let ERC20Contract;
  let network =
    hardhatArguments.network === undefined
      ? "hardhat"
      : hardhatArguments.network;
  let accounts;
  before(async () => {
    accounts = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("ERC721Token");
    nftContract = await NFT.deploy("Fraction Asset Registry", "FAR");
    let txn = await nftContract.addToWhitelist(accounts[1].address);
    await txn.wait();
  });

  //Test scenario 1
  it("Mint NFT and fractionalize it", async () => {
    let params = {
      deedNo: "1",
      assetID: "2",
      issuerID: "3",
      projectID: "4",
      name: "Fraction property hotel",
      symbol: "FPH",
      totalSupply: ethers.utils.parseEther("1000"),
    };
    let txn = await nftContract
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
    let event = await txn.wait();
    event = event.events.find((event) => event.event === "CreatedNFT");
    const [, erc20Token, owner] = event.args;
    ERC20Contract = await ethers.getContractAt("ERC20Token", erc20Token);
    let erc20Balance = await ERC20Contract.balanceOf(accounts[1].address);
    expect(owner).to.be.equal(
      accounts[1].address,
      "owner address doesn't match"
    );
    expect(erc20Balance).to.be.equal(
      params.totalSupply,
      "owner balance doesn't match"
    );
  });

  async function transferTokens(account, amount) {
    let transfer = await ERC20Contract.connect(accounts[1]).transfer(
      account.address,
      amount
    );
    await transfer.wait();
    let balance = await ERC20Contract.balanceOf(account.address);
    expect(balance).to.be.equal(amount);
  }

  async function setApproval(account, amount) {
    let approve = await ERC20Contract.connect(account).approve(
      accounts[10].address,
      amount
    );
    await approve.wait();
    let allowance = await ERC20Contract.allowance(
      account.address,
      accounts[10].address
    );
    expect(allowance).to.be.equal(amount);
  }

  //Test scenario 2
  it("test batch transfer", async () => {
    let amount = ethers.utils.parseEther("5").toString();
    let arr = [accounts[0], accounts[2], accounts[3]];
    for (let i = 0; i < arr.length; i++) {
      await transferTokens(arr[i], amount);
      await setApproval(arr[i], amount);
    }

    let from = [accounts[0].address, accounts[2].address, accounts[3].address];
    let to = [accounts[4].address, accounts[5].address, accounts[6].address];
    let amounts = [amount, amount, amount];
    let batchTransfer = await ERC20Contract.connect(
      accounts[10]
    ).batchTransferFrom(from, to, amounts);
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
});

const { expect } = require("chai");
const { ethers, hardhatArguments } = require("hardhat");

describe("Tests for ERC1155 approach", async function () {
  let nftContract;
  let network =
    hardhatArguments.network === undefined
      ? "hardhat"
      : hardhatArguments.network;
  let accounts;
  before(async () => {
    accounts = await ethers.getSigners();
    NFT = await ethers.getContractFactory("ERC1155Token");
    nftContract = await NFT.deploy("data:application/json;base64,");
    let txn = await nftContract.addToWhitelist(accounts[1].address);
    await txn.wait();
  });

  async function transferTokens(account) {
    let transfer = await nftContract
      .connect(accounts[1])
      .safeTransferFrom(accounts[1].address, account.address, 0, 10, "0x");
    await transfer.wait();
    let balance = await nftContract.balanceOf(account.address, 0);
    expect(parseInt(balance)).to.be.equal(10);
  }
  async function setApproval(account) {
    let approve = await nftContract
      .connect(account)
      .setApprovalForAll(accounts[10].address, true);
    await approve.wait();
    let isApproved = await nftContract.isApprovedForAll(
      account.address,
      accounts[10].address
    );
    expect(isApproved).to.be.equal(true);
  }

  //Test scenario 1
  it("Mint NFT and fractionalize it", async () => {
    let params = {
      deedNo: "1",
      assetID: "2",
      issuerID: "3",
      projectID: "4",
      totalSupply: 100,
    };

    let txn = await nftContract
      .connect(accounts[1])
      .createToken(
        params.deedNo,
        params.assetID,
        params.issuerID,
        params.projectID,
        params.totalSupply
      );
    let event = await txn.wait();
    event = event.events.find((event) => event.event === "CreatedNFT");
    const [, , owner] = event.args;
    let balance = await nftContract.balanceOf(accounts[1].address, 0);
    let supply = await nftContract.totalSupply(0);
    expect(owner).to.be.equal(
      accounts[1].address,
      "owner address doesn't match"
    );
    expect(params.totalSupply + 1).to.be.equal(
      parseInt(balance),
      "owner balance doesn't match"
    );
    expect(params.totalSupply + 1).to.be.equal(
      parseInt(supply),
      "totalSupply doesn't match"
    );
  });

  //Test scenario 2
  it("Test batch transfer", async () => {
    let arr = [accounts[0], accounts[2], accounts[3]];
    for (let i = 0; i < arr.length; i++) {
      await transferTokens(arr[i]);
      await setApproval(arr[i]);
    }
    let from = [accounts[0].address, accounts[2].address, accounts[3].address];
    let to = [accounts[4].address, accounts[5].address, accounts[6].address];
    let ids = [0, 0, 0];
    let amounts = [5, 5, 5];
    let batchTransfer = await nftContract
      .connect(accounts[10])
      .safeBulkTransferFrom(from, to, ids, amounts, "0x");
    let event = await batchTransfer.wait();
    event = event.events.find((event) => event.event === "TransferBulk");
    const [operator, _from, _to, _ids, _amounts] = event.args;
    expect(from.length).to.be.equal(
      _from.length,
      "from array length doesn't match"
    );
    expect(to.length).to.be.equal(_to.length, "to array length doesn't match");
    expect(ids.length).to.be.equal(
      _ids.length,
      "ids array length doesn't match"
    );
    expect(amounts.length).to.be.equal(
      _amounts.length,
      "amounts array length doesn't match"
    );
  });
});

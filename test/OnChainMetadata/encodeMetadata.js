const { expect } = require("chai");
const { ethers } = require("hardhat");
const { metadata } = require("../utils");

describe("Tests for OnChainMetadata contract", async function () {
  let metadataContract;

  before(async () => {
    onChainMetadata = await ethers.getContractFactory("TestOnChainMetadata");
    metadataContract = await onChainMetadata.deploy();
  });

  it("encode metadata to base64 and compare it", async () => {
    // encode given metadata and return formatted token URI
    const encodedURI = await metadataContract.formatTokenURI(
      metadata.deedNo,
      metadata.assetID,
      metadata.issuerID,
      metadata.projectID
    );

    // split the base uri and encoded base64 string
    let base64Data = encodedURI.split(",");
    base64Data = base64Data[1];
    const decodedData = JSON.parse(atob(base64Data));

    //compare decoded metadata with the original metadata
    expect(JSON.stringify(metadata)).to.be.equal(
      JSON.stringify(decodedData),
      "Metadata doesn't match"
    );
  });
});

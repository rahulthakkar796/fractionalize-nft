import { expect } from "chai";
import { ethers } from "hardhat";
import {
  TestOnChainMetadata,
  TestOnChainMetadata__factory
} from "../../typechain";
import { metadata } from "../../utils";


describe("Tests for OnChainMetadata contract", async function () {
  let metadataContract: TestOnChainMetadata;

  before(async () => {
    const signers = await ethers.getSigners();
    const onChainFactory = new TestOnChainMetadata__factory(signers[0]);
    metadataContract = await onChainFactory.deploy();
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
    let base64 = encodedURI.split(",");
    let base64Data = base64[1];
    const decodedData = JSON.parse(atob(base64Data));

    //compare decoded metadata with the original metadata
    expect(JSON.stringify(metadata)).to.be.equal(
      JSON.stringify(decodedData),
      "Metadata doesn't match"
    );
  });
});

// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;
import {OnChainMetadata} from "../utils/OnChainMetadata.sol";

contract TestOnChainMetadata {
    function formatTokenURI(
        string memory _deedNo,
        string memory _assetID,
        string memory _issuerID,
        string memory _projectID
    ) external pure returns (string memory) {
        return
            OnChainMetadata.formatTokenURI(
                _deedNo,
                _assetID,
                _issuerID,
                _projectID
            );
    }
}

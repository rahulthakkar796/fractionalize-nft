// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;
import {Base64} from "./Base64.sol";

library OnChainMetadata {

    /// @notice encodes metadata to base64 URI.
    /// @param _deedNo deed number provided by user
    /// @param _assetID asset ID provided by user
    /// @param _issuerID issuer ID provided by user
    /// @param _projectID project ID provided by user
    /// @return returns encoded base64 token URI
    function formatTokenURI(
        string memory _deedNo,
        string memory _assetID,
        string memory _issuerID,
        string memory _projectID
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"deedNo":"',
                                _deedNo,
                                '", "assetID":"',
                                _assetID,
                                '","issuerID":"',
                                _issuerID,
                                '","projectID":"',
                                _projectID,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}

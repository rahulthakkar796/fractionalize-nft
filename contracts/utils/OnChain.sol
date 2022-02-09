// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import "../utils/Base64.sol";

contract OnChainMetadata {
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

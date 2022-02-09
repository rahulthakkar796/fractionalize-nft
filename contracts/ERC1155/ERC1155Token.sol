// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import {OnChainMetadata} from "../utils/OnChain.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Token is ERC1155Supply, Ownable, OnChainMetadata {
    uint256 private tokenCounter;
    struct FractionDetails {
        address issuer;
        uint256 tokenID;
        uint256 fractions;
    }
    mapping(uint256 => string) private _uris;
    mapping(address => bool) public whitelist;
    mapping(uint256 => FractionDetails) public fractionDetails;

    event TransferBulk(
        address indexed operator,
        address[] from,
        address[] to,
        uint256[] ids,
        uint256[] values
    );
    modifier onlyIssuer(uint256 _id) {
        require(
            msg.sender == fractionDetails[_id].issuer,
            "Caller is not an issuer of the given NFT"
        );
        _;
    }
    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Caller is not an authorized issuer");
        _;
    }
    event CreatedNFT(
        uint256 indexed tokenId,
        address indexed nft,
        address indexed issuer
    );

    /// @param _uri baseUri to serve the metadata
    constructor(string memory _uri) ERC1155(_uri) {}

    /// @notice return the uri for the given tokenId
    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return (_uris[_tokenId]);
    }

    /// @notice creates a NFT and fractionalizes it.
    /// @param _deedNo deed number provided by user
    /// @param _assetID asset ID provided by user
    /// @param _issuerID issuer ID provided by user
    /// @param _projectID project ID provided by user
    /// @param _totalSupply totalSupply of NFT you want fractionalize
    function createToken(
        string memory _deedNo,
        string memory _assetID,
        string memory _issuerID,
        string memory _projectID,
        uint256 _totalSupply
    ) external virtual onlyWhitelisted {
        _mint(msg.sender, tokenCounter, _totalSupply + 1, "");
        _setTokenURI(tokenCounter, _deedNo, _assetID, _issuerID, _projectID);
        fractionDetails[tokenCounter].tokenID = tokenCounter;
        fractionDetails[tokenCounter].issuer = msg.sender;
        fractionDetails[tokenCounter].fractions = _totalSupply;
        emit CreatedNFT(tokenCounter, address(this), msg.sender);
        tokenCounter++;
    }

    ///@notice set the token URI for the given NFT
    function _setTokenURI(
        uint256 tokenId,
        string memory _deedNo,
        string memory _assetID,
        string memory _issuerID,
        string memory _projectID
    ) internal {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
        _uris[tokenId] = formatTokenURI(
            _deedNo,
            _assetID,
            _issuerID,
            _projectID
        );
    }

    ///@notice Whitelits the given address
    ///@param _issuer address of the issuer you want to whitelist
    function addToWhitelist(address _issuer) external onlyOwner {
        require(
            !whitelist[_issuer],
            "addToWhitelist: issuer is already whitelisted"
        );
        whitelist[_issuer] = true;
    }

    ///@notice Removes the given address from the whitelist
    ///@param _issuer address of the issuer you want to remove from the whielist
    function removeFromWhitelist(address _issuer) external onlyOwner {
        require(
            whitelist[_issuer],
            "removeFromWhitelist: issuer is not whitelisted yet"
        );
        whitelist[_issuer] = false;
    }

    ///@notice mints fractionalized NFTs for the given NFT ID
    ///@param _to address to send the NFT tokens
    ///@param _id NFT ID to mint the tokens for this ID
    ///@param _amount Amount of tokens you want to mint
    function mint(
        address _to,
        uint256 _id,
        uint256 _amount
    ) external onlyIssuer(_id) {
        _mint(_to, _id, _amount, "");
        fractionDetails[_id].fractions += _amount;
    }

    function safeBulkTransferFrom(
        address[] calldata _from,
        address[] calldata _to,
        uint256[] calldata _ids,
        uint256[] calldata _amounts,
        bytes calldata _data
    ) external {
        require(
            _from.length == _to.length &&
                _ids.length == _amounts.length &&
                _ids.length == _from.length,
            "safeBulkTransferFrom: arrays mismatch"
        );
        for (uint256 i = 0; i < _from.length; ++i) {
            safeTransferFrom(_from[i], _to[i], _ids[i], _amounts[i], _data);
        }

        emit TransferBulk(msg.sender, _from, _to, _ids, _amounts);
    }
}

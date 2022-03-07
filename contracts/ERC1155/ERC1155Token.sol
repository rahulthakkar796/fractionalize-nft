// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;
import {OnChainMetadata} from "../utils/OnChainMetadata.sol";
import {ERC1155Supply, ERC1155} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {WhiteList} from "../utils/WhiteList.sol";

contract ERC1155Token is ERC1155Supply, Ownable, WhiteList {
    uint256 private tokenCounter;
    struct FractionDetails {
        address issuer;
        uint256 tokenID;
        uint256 tokens;
    }
    mapping(uint256 => string) private _uris;
    mapping(uint256 => FractionDetails) public fractionDetails;

    event TransferBulk(
        address indexed operator,
        address[] from,
        address[] to,
        uint256[] ids,
        uint256[] values
    );
    event CreatedNFT(
        uint256 indexed tokenId,
        address indexed issuer
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
    

    /// @param _uri baseUri to serve the metadata
    constructor(string memory _uri) ERC1155(_uri) {}

    /// @notice Return the uri for the given tokenId
    /// @return returns encoded base64 token uri
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
    ) external onlyWhitelisted {
        uint256 tokenID= tokenCounter;
        tokenCounter++;
        _mint(msg.sender, tokenID, _totalSupply + 1, "");
        _setTokenURI(tokenID, _deedNo, _assetID, _issuerID, _projectID);
        fractionDetails[tokenID].tokenID = tokenID;
        fractionDetails[tokenID].issuer = msg.sender;
        fractionDetails[tokenID].tokens = _totalSupply;
        emit CreatedNFT(tokenID,  msg.sender);
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
        _uris[tokenId] = OnChainMetadata.formatTokenURI(
            _deedNo,
            _assetID,
            _issuerID,
            _projectID
        );
    }

    ///@notice Whitelits the given address
    ///@param _issuer address of the issuer you want to whitelist
    function addToWhitelist(address _issuer) public override onlyOwner {
        super.addToWhitelist(_issuer);
    }

    ///@notice Removes the given address from the whitelist
    ///@param _issuer address of the issuer you want to remove from the whielist
    function removeFromWhitelist(address _issuer) public override onlyOwner {
        super.removeFromWhitelist(_issuer);
    }

    ///@notice mints fractionalized NFTs for the given NFT ID
    ///@param _to address to send the NFT tokens
    ///@param _id NFT ID to mint the tokens for this ID
    ///@param _amount Amount of tokens you want to mint
    function mintTokens(
        address _to,
        uint256 _id,
        uint256 _amount
    ) external onlyIssuer(_id) {
        fractionDetails[_id].tokens += _amount;
        _mint(_to, _id, _amount, "");
    }

    ///@notice Performs bulk transfer
    ///@dev Can be used to perform many-to-many and one-to-many bulk transfer
    ///@param _from array of from addresses to send the tokens from(pass multi address array for many-to-many and pass single address array for one-to-many)
    ///@param _to array of to addresses to receive the tokens
    ///@param _ids array of NFT ids to transfer
    ///@param _amounts array of amounts
    ///@param _data bytes data you want to pass along with the transaction
    function safeBulkTransferFrom(
        address[] calldata _from,
        address[] calldata _to,
        uint256[] calldata _ids,
        uint256[] calldata _amounts,
        bytes calldata _data
    ) external {
        if(_from.length>1){
            require(
                (_from.length == _to.length) &&
                    (_ids.length == _amounts.length) &&
                    (_amounts.length == _from.length),
                "safeBulkTransferFrom: arrays mismatch"
            );
            for (uint256 i = 0; i < _from.length; ++i) {
                safeTransferFrom(_from[i], _to[i], _ids[i], _amounts[i], _data);
            }
        }
        else if(_from.length==1){
            require(_to.length == _ids.length && _ids.length == _amounts.length,"safeBulkTransferFrom:arrays mismatch");
            for (uint256 i = 0; i < _to.length; ++i) {
                safeTransferFrom(_from[0], _to[i], _ids[i], _amounts[i], _data);
            }
        }
        emit TransferBulk(msg.sender, _from, _to, _ids, _amounts);
    }
}

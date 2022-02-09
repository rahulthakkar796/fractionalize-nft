// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import {ERC20Token} from "./ERC20.sol";
import {OnChainMetadata} from "../utils/OnChain.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Token is ERC721URIStorage, OnChainMetadata, Ownable {
    uint256 private tokenCounter;
    struct FractionDetails {
        address issuer;
        address erc20Token;
        uint256 tokenID;
    }

    mapping(address => bool) public whitelist;
    mapping(uint256 => FractionDetails) public fractionDetails;

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Caller is not an authorized issuer");
        _;
    }

    event CreatedNFT(uint256 indexed tokenId, address erc20, address owner);

    /// @param _name name of the NFT
    /// @param _symbol symbol of the NFT
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    /// @notice creates a NFT and fractionalizes it.
    /// @param _deedNo deed number provided by user
    /// @param _assetID asset ID provided by user
    /// @param _issuerID issuer ID provided by user
    /// @param _projectID project ID provided by user
    /// @param _name name of the ERC20 token that's going to fractionalize the minted NFT
    /// @param _symbol symbol of the ERC20 token that's going to fractionalize the minted NFT
    /// @param _totalSupply totalSupply of the ERC20 token that's going to fractionalize the minted NFT
    function createToken(
        string memory _deedNo,
        string memory _assetID,
        string memory _issuerID,
        string memory _projectID,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) external virtual onlyWhitelisted returns (address) {
        _safeMint(msg.sender, tokenCounter);
        _setTokenURI(
            tokenCounter,
            formatTokenURI(_deedNo, _assetID, _issuerID, _projectID)
        );
        ERC20Token token = new ERC20Token(
            _name,
            _symbol,
            _totalSupply,
            msg.sender
        );
        fractionDetails[tokenCounter].tokenID = tokenCounter;
        fractionDetails[tokenCounter].issuer = msg.sender;
        fractionDetails[tokenCounter].erc20Token = address(token);
        emit CreatedNFT(tokenCounter, address(token), msg.sender);
        tokenCounter++;
        return address(token);
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
}

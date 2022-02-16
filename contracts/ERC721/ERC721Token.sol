// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;
import {ERC20Token} from "./ERC20Token.sol";
import {OnChainMetadata} from "../utils/OnChainMetadata.sol";
import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {WhiteList} from "../utils/WhiteList.sol";

contract ERC721Token is ERC721URIStorage, Ownable, WhiteList {
    uint256 private tokenCounter;
    
    struct FractionDetails {
        address issuer;
        address erc20Token;
        uint256 tokenID;
    }

    mapping(uint256 => FractionDetails) public fractionDetails;

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Caller is not an authorized issuer");
        _;
    }

    event CreatedNFT(uint256 indexed tokenId, address erc20, address indexed owner);

    /// @param _name name of the NFT
    /// @param _symbol symbol of the NFT
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    /// @notice Creates a NFT and fractionalizes it using ERC20 token, deploys new ERC20 token contract for each asset.
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
    ) external onlyWhitelisted returns (address) {
        uint256 tokenID=tokenCounter;
        tokenCounter++;
        _safeMint(msg.sender, tokenID);
        _setTokenURI(
            tokenID,
            OnChainMetadata.formatTokenURI(
                _deedNo,
                _assetID,
                _issuerID,
                _projectID
            )
        );
        ERC20Token token = new ERC20Token(
            _name,
            _symbol,
            _totalSupply,
            msg.sender
        );
        fractionDetails[tokenID].tokenID = tokenID;
        fractionDetails[tokenID].issuer = msg.sender;
        fractionDetails[tokenID].erc20Token = address(token);
        emit CreatedNFT(tokenID, address(token), msg.sender);
        return address(token);
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
}

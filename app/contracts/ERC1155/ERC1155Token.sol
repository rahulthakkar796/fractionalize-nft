// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;
import {OnChainMetadata} from "../utils/OnChainMetadata.sol";
import {ERC1155Supply, ERC1155} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {WhiteList} from "../utils/WhiteList.sol";
import {Signature, EIP712} from "../utils/Signature.sol";

contract ERC1155Token is ERC1155Supply, Ownable, WhiteList, Signature {
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
    event CreatedNFT(uint256 indexed tokenId, address indexed issuer);

    modifier onlyIssuer(AdditionalMint calldata mint) {
        address signer = _verifyAdditionalMint(mint);
        if (signer != fractionDetails[mint.id].issuer) {
            revert CallerNotIssuerOfNFT(signer, mint.id);
        }
        _;
    }
    modifier onlyWhitelisted(NFTMint calldata nft) {
        address signer = _verifyNFT(nft);
        if (!whitelist[signer]) {
            revert AddressNotWhitelisted(signer);
        }
        _;
    }

    //reverts when the caller is not the owner of the NFT
    error CallerNotIssuerOfNFT(address issuer, uint256 id);

    //reverts when the issuer is not whitelisted
    error AddressNotWhitelisted(address issuer);

    /// @param _uri baseUri to serve the metadata
    constructor(string memory _uri)
        ERC1155(_uri)
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)
    {}

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

    /// @notice Verifies signature, mints and fractionalizes the NFT
    /// @dev only owner can call this function and signer of the signature must be a whitlisted address
    /// @param nft the object of the NFTMint struct along with a signed signature of the owner of the asset
    function createToken(NFTMint calldata nft)
        external
        onlyOwner
        onlyWhitelisted(nft)
    {
        uint256 tokenID = tokenCounter;
        tokenCounter++;
        _mint(nft.issuer, tokenID, nft.totalSupply, ""); //assign fractional tokens to the issuer
        _setTokenURI(
            tokenID,
            nft.deedNo,
            nft.assetID,
            nft.issuerID,
            nft.projectID
        );
        fractionDetails[tokenID].tokenID = tokenID;
        fractionDetails[tokenID].issuer = nft.issuer;
        fractionDetails[tokenID].tokens = nft.totalSupply;
        emit CreatedNFT(tokenID, nft.issuer);
    }

    /// @notice set the token URI for the given NFT
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

    /// @notice Whitelits the given address
    /// @dev only owner can call this function
    /// @param _issuer address of the issuer you want to whitelist
    function addToWhitelist(address _issuer) public override onlyOwner {
        super.addToWhitelist(_issuer);
    }

    /// @notice Removes the given address from the whitelist
    /// @dev only owner can call this function
    /// @param _issuer address of the issuer you want to remove from the whielist
    function removeFromWhitelist(address _issuer) public override onlyOwner {
        super.removeFromWhitelist(_issuer);
    }

    /// @notice mints fractionalized NFTs for the given NFT ID
    /// @param mint the object of the AdditionalMint struct along with a signed signature of the issuer of the NFT
    function mintTokens(AdditionalMint calldata mint)
        external
        onlyIssuer(mint)
        onlyOwner
    {
        fractionDetails[mint.id].tokens += mint.amount;
        _mint(mint.to, mint.id, mint.amount, "");
    }

    /// @notice Performs bulk transfer
    /// @dev Can be used to perform many-to-many and one-to-many bulk transfer
    /// @param _from array of from addresses to send the tokens from(pass multi address array for many-to-many and pass single address array for one-to-many)
    /// @param _to array of to addresses to receive the tokens
    /// @param _ids array of NFT ids to transfer
    /// @param _amounts array of amounts
    function safeBulkTransferFrom(
        address[] memory _from,
        address[] memory _to,
        uint256[] calldata _ids,
        uint256[] calldata _amounts,
        bytes calldata data
    ) public {
        if (_from.length > 1) {
            require(
                (_from.length == _to.length) &&
                    (_ids.length == _amounts.length) &&
                    (_amounts.length == _from.length),
                "safeBulkTransferFrom: arrays mismatch"
            );
            for (uint256 i = 0; i < _from.length; ++i) {
                safeTransferFrom(_from[i], _to[i], _ids[i], _amounts[i], data);
            }
        } else if (_from.length == 1) {
            require(
                _to.length == _ids.length && _ids.length == _amounts.length,
                "safeBulkTransferFrom:arrays mismatch"
            );
            for (uint256 i = 0; i < _to.length; ++i) {
                safeTransferFrom(_from[0], _to[i], _ids[i], _amounts[i], data);
            }
        }
        emit TransferBulk(msg.sender, _from, _to, _ids, _amounts);
    }

    /// @notice permit function for gasless approvals
    /// @dev only owner can call this function
    /// @param _permit the object of the Permit struct along with a signed signature by the owner of the NFT
    function permit(Permit calldata _permit) public onlyOwner {
        address signer = _verifyPermit(_permit);
        require(signer == _permit.owner, "Signature mismatch");
        _setApprovalForAll(_permit.owner, _permit.spender, _permit.approved);
    }
}

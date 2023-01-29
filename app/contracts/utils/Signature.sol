// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

abstract contract Signature is EIP712 {
    string internal constant SIGNING_DOMAIN = "FRACTION_GASLESS";
    string internal constant SIGNATURE_VERSION = "1";

    /// @notice Represents a permit, signed by the NFT owner to perform gasless transactions
    /// @param owner address of the NFT owner
    /// @param spender address that will get access to transfer tokens on behalf of the owner
    /// @param approved bool value to grant / revoke approve permit from the given spender
    /// @param signature signature signed by the owner address to perform a gasless transfers
    struct Permit {
        address owner;
        address spender;
        bool approved;
        bytes signature;
    }

    /// @notice Represents a NFT mint message, signed by the whitelisted issuer to mint a new NFT through gasless transaction
    /// @param owner whitelisted issuer address that has signed this message and want to mint a NFT
    /// @param deedNo deed number of the asset
    /// @param assetID asset ID of the asset
    /// @param issuerID issuer ID of the asset
    /// @param projectID  project ID of the asset
    /// @param totalSupply initial total supply of the fractions of the NFT.
    /// @param signature signature signed by the owner address to perform a gasless minting
    struct NFTMint {
        address issuer;
        string deedNo;
        string assetID;
        string issuerID;
        string projectID;
        uint256 totalSupply;
        bytes signature;
    }

    /// @notice Represents a Additional mint message, signed by the issuer of the given NFT to mint a additional NFTs through gasless transaction
    /// @param to address to mint tokens to
    /// @param id NFT ID
    /// @param amount amount of tokens you want to mint
    /// @param signature signature signed by the owner address to perform a gasless minting
    struct AdditionalMint {
        address to;
        uint256 id;
        uint256 amount;
        bytes signature;
    }

    /// @notice Returns a hash of the Permit struct signature and its parameters, it doesn't include signature property of the Permit struct
    /// @param permit instance of the Permit struct
    function _hashPermit(Permit calldata permit) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,bool approved)"
                        ),
                        permit.owner,
                        permit.spender,
                        permit.approved
                    )
                )
            );
    }

    /// @notice Returns a hash of the NFT struct signature and its parameters, it doesn't include signature property of the NFTMint struct
    /// @param nft instance of the NFTMint struct
    function _hashNFT(NFTMint calldata nft) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTMint(address issuer,string deedNo,string assetID,string issuerID,string projectID,uint256 totalSupply)"
                        ),
                        nft.issuer,
                        keccak256(bytes(nft.deedNo)),
                        keccak256(bytes(nft.assetID)),
                        keccak256(bytes(nft.issuerID)),
                        keccak256(bytes(nft.projectID)),
                        nft.totalSupply
                    )
                )
            );
    }

    /// @notice Returns a hash of the AdditionalMint struct signature and its parameters, it doesn't include signature property of the AdditionalMint struct
    /// @param mint instance of the AdditionalMint struct
    function _hashAdditionalMint(AdditionalMint calldata mint)
        public
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "AdditionalMint(address to,uint256 id,uint256 amount)"
                        ),
                        mint.to,
                        mint.id,
                        mint.amount
                    )
                )
            );
    }

    /// @notice Returns the chain id of the current blockchain.
    /// @dev This is used to workaround an issue with ganache returning different values from the on-chain chainid() function and
    /// the eth_chainId RPC method. See https://github.com/protocol/nft-website/issues/121 for context.
    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /// @notice Verifies the permit signature and returns the address of the signer
    /// @param permit instance of the Permit struct along with signed signature inside
    function _verifyPermit(Permit calldata permit)
        public
        view
        returns (address)
    {
        bytes32 digest = _hashPermit(permit);
        return ECDSA.recover(digest, permit.signature);
    }

    /// @notice Verifies the nft signature and returns the address of the signer
    /// @param nft instance of the NFTMint struct along with signed signature inside
    function _verifyNFT(NFTMint calldata nft) public view returns (address) {
        bytes32 digest = _hashNFT(nft);
        return ECDSA.recover(digest, nft.signature);
    }

    /// @notice Verifies the mint signature and returns the address of the signer
    /// @param mint instance of the AdditionalMint struct along with signed signature inside
    function _verifyAdditionalMint(AdditionalMint calldata mint)
        public
        view
        returns (address)
    {
        bytes32 digest = _hashAdditionalMint(mint);
        return ECDSA.recover(digest, mint.signature);
    }
}

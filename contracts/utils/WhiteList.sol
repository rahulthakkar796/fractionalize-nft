// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;

abstract contract WhiteList {
    mapping(address => bool) public whitelist;

    ///@notice Whitelits the given address
    ///@param _issuer address of the issuer you want to whitelist
    function addToWhitelist(address _issuer) public virtual {
        require(
            !whitelist[_issuer],
            "addToWhitelist: issuer is already whitelisted"
        );
        whitelist[_issuer] = true;
    }

    ///@notice Removes the given address from the whitelist
    ///@param _issuer address of the issuer you want to remove from the whielist
    function removeFromWhitelist(address _issuer) public virtual {
        require(
            whitelist[_issuer],
            "removeFromWhitelist: issuer is not whitelisted yet"
        );
        whitelist[_issuer] = false;
    }
}

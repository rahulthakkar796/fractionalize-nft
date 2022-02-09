// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    event TransferBatch(address[] from, address[] to, uint256[] amounts);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        address _owner
    ) ERC20(_name, _symbol) {
        _mint(_owner, _supply);
        owner = _owner;
    }

    ///@notice Performs batch transfer
    ///@param _from array of from addresses to send the tokens from
    ///@param _to array of to addresses to receive the tokens
    ///@param _amounts array of amounts
    function batchTransferFrom(
        address[] calldata _from,
        address[] calldata _to,
        uint256[] calldata _amounts
    ) external {
        require(
            _from.length == _to.length && _to.length == _amounts.length,
            "batchTransfer: arrays don't match"
        );
        for (uint256 i = 0; i < _to.length; i++) {
            require(
                transferFrom(_from[i], _to[i], _amounts[i]),
                "Unable to transfer token to the account"
            );
        }
        emit TransferBatch(_from, _to, _amounts);
    }

    ///@notice Mints tokens to the given address
    ///@param _to address to mint tokens to
    ///@param _amount amount of tokens to mint
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    /// @notice Transfers ownership of the contract to a new account (`_newOwner`).
    /// @param _newOwner address of the new owner
    function transferOwnership(address _newOwner) external onlyOwner {
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
}

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./BadToken.sol";

contract Bridge {
    uint private swapCount;
    address private validator;

    mapping(bytes32 => bool) private processedMessages;
    mapping(uint => bool) private allowedChainIds;
    mapping(address => address) private allowedTokens; //burn -> mint

    event Swap(
        address mintTokem,
        address to,
        uint amount,
        uint chainId,
        uint nonce
    );
    event Redeem(address to, uint amount);

    modifier requireValidator() {
        require(msg.sender == validator, "You are not the validator.");
        _;
    }

    constructor() {
        validator = msg.sender;
    }

    function swap(
        address _token,
        address _to,
        uint _amount,
        uint _chainId
    ) external returns (uint nonce) {
        require(allowedChainIds[_chainId], "Chain id is not allowed.");
        require(allowedTokens[_token] != address(0), "Token is not allowed.");

        BadToken(_token).burn(msg.sender, _amount);
        nonce = swapCount;
        swapCount++;

        emit Swap(allowedTokens[_token], _to, _amount, _chainId, nonce);
    }

    function redeem(
        address _token,
        address _to,
        uint _amount,
        uint _nonce,
        uint _chainId,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external {
        bytes32 message = keccak256(
            abi.encodePacked(_token, _to, _amount, _nonce, _chainId)
        );

        require(!processedMessages[message], "Swap already done");

        address signer = ecrecover(hashMessage(message), _v, _r, _s);

        require(signer == validator, "Signer mismatch");

        BadToken(_token).mint(_to, _amount);
        processedMessages[message] = true;

        emit Redeem(_to, _amount);
    }

    function updateChainById(uint _chainId, bool _enabled) external {
        allowedChainIds[_chainId] = _enabled;
    }

    function includeToken(address _burnToken, address _mintToken)
        external
        requireValidator
    {
        allowedTokens[_burnToken] = _mintToken;
    }

    function excludeToken(address _burnToken) external requireValidator {
        allowedTokens[_burnToken] = address(0);
    }

    function hashMessage(bytes32 _message) private pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, _message));
    }
}

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BadToken is ERC20 {
    address private owner;

    constructor() ERC20("Bad Token", "BAD") {
        owner = msg.sender;
        _mint(msg.sender, 100_000 * 10**18);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == owner, "You are not the owner.");
        _burn(from, amount);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "You are not the owner.");
        _mint(to, amount);
    }

    function changeOwner(address _owner) external {
        require(msg.sender == owner, "You are not the owner.");
        owner = _owner;
    }
}

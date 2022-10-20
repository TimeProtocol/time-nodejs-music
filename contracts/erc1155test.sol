// erc1155test.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract testNFT is ERC1155 {
    constructor() ERC1155("test") {
        _mint(msg.sender, 0, 10, "");
    }
}
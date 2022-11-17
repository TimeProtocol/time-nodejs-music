//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract TimeLock is ChainlinkClient, ConfirmedOwner, ERC1155Holder {
    using Chainlink for Chainlink.Request;

    bytes32 private jobId;
    uint256 private fee;

    mapping (string => address) public addresses;
    mapping (address => string) public clientIds;

    IERC1155 private nftAddress;

    event MintNFT(bytes32 indexed requestId, string id, int256 nft);

    constructor(address _address) ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x03c80e1985318050A7586c4b56855F1Be60A0dEd);
        jobId = 'a2b81007257c4711be0ea7fab90aa54d';
        nftAddress = IERC1155(_address);
        fee = (1 * LINK_DIVISIBILITY) / 10;
    }

    //  Request the users id from the server
    function mintNFT(string memory _address, string memory _clientId) public returns (bytes32 requestId) {
        clientIds[msg.sender] = _clientId;
        addresses[_clientId] = msg.sender;
        Chainlink.Request memory req = buildOperatorRequest(jobId, this.fulfillMintNFT.selector);
        req.add("address", _address);
        req.add("pathId", "id");
        req.add("pathNFT", "nft");
        return sendOperatorRequest(req, fee);
    }

    function fulfillMintNFT(bytes32 _requestId, string memory _id, int256 _nft) public recordChainlinkFulfillment(_requestId) {
        emit MintNFT(_requestId, _id, _nft);

        //  unpack clientId using address --> clientIds[_addresses[_id]]
        //  unpack address using id --> addresses[_id]
        
        if (_nft > -1) {
            uint256 nft = uint256(_nft);
            if (keccak256(abi.encodePacked(_id)) == keccak256(abi.encodePacked((clientIds[addresses[_id]])))) {
                require(nftAddress.balanceOf(address(this), nft) >= 1);
                nftAddress.safeTransferFrom(address(this), addresses[_id], nft, 1, 'Unable to transfer');
            }
        }
    }

    /**
     * Change the NFT set address
    */
    function setNFTAddress(address _address) public onlyOwner {
        nftAddress = IERC1155(_address);
    }

    /**
     * Allow withdraw of Link tokens from the Contract
    */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }

    /**
     * Withdraw a specific amount of NFTs from the Contract
    */
    function withdrawNFTAmount(uint256 amount, uint256 tokenID) public onlyOwner {
        require(nftAddress.balanceOf(address(this), tokenID) >= amount);
        nftAddress.safeTransferFrom(address(this), msg.sender, tokenID, amount, "");
    }

    /**
     * Withdraw all the NFTs from the Contract
    */
    function withdrawNFTAll(uint256 tokenID) public onlyOwner {
        require(nftAddress.balanceOf(address(this), tokenID) > 0);
        nftAddress.safeTransferFrom(address(this), msg.sender, tokenID, nftAddress.balanceOf(address(this), tokenID), "");
    }
}
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
    uint256 nftID;

    event MintNFT(bytes32 indexed requestId, string id, int256 nft);

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xDe868BdC543c76d22f51624a3F8B767964063014);
        jobId = 'a2b81007257c4711be0ea7fab90aa54d';
        nftAddress = IERC1155(0x886373c9d3EC58f34416680b5C535C7CA3657af3);
        nftID = 0;
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
            if (keccak256(abi.encodePacked(_id)) == keccak256(abi.encodePacked((clientIds[addresses[_id]])))) {
                require(nftAddress.balanceOf(address(this), nftID) >= 1);
                nftAddress.safeTransferFrom(address(this), addresses[_id], nftID, 1, 'Unable to transfer');
            }
        }
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }

    /**
     * Allow withdraw of deposited ERC1155 NFTs from the contract
    */
    function withdrawERC1155NFT(uint256 amount) public onlyOwner {
        require(nftAddress.balanceOf(address(this), nftID) >= amount);
        nftAddress.safeTransferFrom(address(this), msg.sender, nftID, amount, "");
    }
}
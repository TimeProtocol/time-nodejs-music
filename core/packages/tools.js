//  tools.js
//  ========

const ethers = require('ethers');

module.exports = {

    getRandomInt: function() {
        return Math.floor(Math.random() * max); 
    },

    balanceOf: async function(user_address = -1) {
        const abi = [
            "function balanceOf(address, uint) public view returns (uint256)",
        ];

        //  test erc1155 NFT
        var token_address = "0x886373c9d3EC58f34416680b5C535C7CA3657af3";
        var nft_address = "0x0d81E7f628282Ba4e7df2c89E5108eC75a482b35";
        var token_id = "0";

        if (user_address != -1) {
            nft_address = user_address;
        }

        const provider = new ethers.providers.InfuraProvider(
            process.env.ETHEREUM_NETWORK,
            process.env.INFURA_API_KEY
        );

        try {
            let contract = new ethers.Contract(token_address, abi, provider);
            var amount = await contract.balanceOf(nft_address, token_id);
            var newAmount = parseInt(amount);
            return newAmount;
        } catch(err) {
            debug.error(err);
        }
    }

}
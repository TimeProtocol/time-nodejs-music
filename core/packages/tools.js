//  tools.js
//  ========

const ethers = require('ethers');
const db = require('./db.js');
const debug = require('./debug.js');

module.exports = {

    getRandomInt: function(max) {
        return Math.floor(Math.random() * max); 
    },

    balanceOf: async function(token_id = "0", user_address = -1) {
        const abi = [
            "function balanceOf(address, uint) public view returns (uint256)",
        ];

        //  test erc1155 NFT
        var nft_address = "0xF7c2FE2e0934b057a52856DAef75ce21C46394B0";
        var timelock_address = "0x4d4807e5154a694Aa87F8EbfefDcB1080b1aAa79";

        if (user_address != -1) {
            timelock_address = user_address;
        }

        const provider = new ethers.providers.InfuraProvider(
            process.env.ETHEREUM_NETWORK,
            process.env.INFURA_API_KEY
        );

        try {
            let contract = new ethers.Contract(nft_address, abi, provider);
            var amount = await contract.balanceOf(timelock_address, token_id);
            var newAmount = parseInt(amount);
            return newAmount;
        } catch(err) {
            debug.error(err);
        }
    },

    getCurrentTimeString: function() {
        var date = new Date();
        var hour = date.getHours();
        if (hour > 12) hour = hour - 12;
        var minutes = date.getMinutes();
        if (minutes < 10) {
            var temp = "0";
            temp += String(minutes);
            minutes = temp;
        }
        var seconds = date.getSeconds();
        if (seconds < 10) {
            var temp = "0";
            temp += String(seconds);
            seconds = temp;
        }

        var time = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hour}:${minutes}:${seconds}`;

        return time;
    },

    getCurrentTimeMS: function() {
        var time = Date.now();
        return time;
    },

    //  returns true if the first date is equal to or further than the second date AND its greater than the 'block' speed
    compareTimes: async function(date1, date2) {
        if (date1 > date2) {

            var difference = (date1 - date2);

            var promise = await db.Query(`SELECT amountStarted, daysToMine FROM nfts`);
            var days = promise[0].daysToMine;
            var amountStarted = promise[0].amountStarted;

            var hours = 24 / (amountStarted / days);
            var milliseconds = (hours * 60 * 60 * 1000);

            if (difference >= milliseconds) {
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }
    }

}
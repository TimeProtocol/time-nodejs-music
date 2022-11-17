//  eventlisteners.js
//  =================

const ethers = require('ethers');
const db = require('./db.js');
const debug = require('./debug.js');
const ethRPC = process.env.INFURA_ENDPOINT;

module.exports = {

    Filter: function(_address, _methodID) {
        this.address = _address;
        this.topics = [ethers.utils.id(_methodID)]; 
    },

    GetTransactionHash: async function (_transactionHash) {
        const provider = new ethers.providers.InfuraProvider(
            process.env.ETHEREUM_NETWORK,
            process.env.INFURA_API_KEY
        )
        try {
            var hash = await provider.getTransaction(_transactionHash);
            return hash;
        } catch (err) {
            throw err;
        } 
    },

    GetTransactionFromAddress: async function (_hash) {
        try {
            var hash = await this.GetTransactionHash(_hash);
            return hash.from;
        } catch (err) {
            throw err;
        } 
    },

    EventChainlinkRequested: async function (filter) {
        const provider = new ethers.providers.InfuraProvider(
            process.env.ETHEREUM_NETWORK,
            process.env.INFURA_API_KEY
        )

        provider.on(filter, async (bytes) => {
            debug.log(`Event ChainlinkRequested!`);
            debug.log(bytes);

            try {
                var address = await this.GetTransactionFromAddress(bytes.transactionHash);
                var requestID = bytes.topics[1];   //  the requestID is the second value in the array --> [1]

                await db.Query(`UPDATE users SET requestID=? WHERE address=?`, [requestID, address]);

            } catch(err) {
                debug.error(err);
            }

        })
    },

    EventChainlinkFulfilled: async function(filter) {
        const provider = new ethers.providers.InfuraProvider(
            process.env.ETHEREUM_NETWORK,
            process.env.INFURA_API_KEY
        )

        provider.on(filter, async (bytes) => {
            debug.log(`Event ChainlinkFulfilled!`);
            debug.log(bytes);

            try {
                var requestID = bytes.topics[1];    //  the requestID is the second value in the array --> [1]

                var query = await db.Query(`SELECT address FROM users WHERE requestID=?`, [requestID]);
                if (query.length > 0) {
                    if (query[0].address) {
                        var address = query[0].address;

                        await db.Query(`UPDATE users SET requestID=? WHERE address=?`, ["-1", address]);
                        await db.Query(`UPDATE users SET nft=? WHERE address=?`, [-1, address]);
                    }
                }

            } catch(err) {
                debug.error(err);
            }
        })
    }

}
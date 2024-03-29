const ethers = require('ethers');
const dir = __dirname;
require('dotenv').config({path: dir + '/.env'});
const tools = require('./packages/tools.js');
const eventlisteners = require('./packages/eventlisteners.js');
const debug = require('./packages/debug.js');
const db = require('./packages/db.js');
var pson = require('./package.json');
var music = require(`./packages/music.js`);
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
app.use(express.json());
app.use(require('body-parser').urlencoded( { extended: true } ));

const http = require('http');
const server = http.createServer();

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

const version = pson.version;
const mode = 'DEVELOP';
const port = 8080;

let users = 0;

const ALBUM_URI = "6oYvjbrNIu0lA5QAi33K1q";

async function main() {
    debug.section(`=====     WELCOME TO TIME     =====`, `\x1b[32m%s\x1b[0m`);
    debug.log(`...> running version ${version} in ${mode}`);

    //  db boot sequence
    try {
        var bootResult = await db.boot();
        if (bootResult.error == false) {
            debug.log(`database booted without errors!`);
            users = bootResult.users;
            debug.log(`number of Users that were signed in: ${users}`);

            //  Check time since last NFT serve
            let promise = await db.Query(`SELECT * FROM nfts`);

            //  This Node hasn't served any NFTs yet
            if (promise.length == 0) {
                debug.log(`this Node hasn't served any NFTs yet...`);

                var timeString = tools.getCurrentTimeString();
                var timeMS = tools.getCurrentTimeMS();

                await db.Query(`INSERT INTO nfts (nft, lastServeTimeString, lastServeTimeMS, amountStarted, amountLeft, daysToMine) VALUES (?, ?, ?, ?, ?, ?)`, [ALBUM_URI, timeString, timeMS, 300, 300, 0.50]);

                var nextBlockTimeMS = await tools.getNextBlockTimeMS();

                await db.Query(`UPDATE nfts SET nextServeTimeMS=? WHERE nft=?`, [nextBlockTimeMS, ALBUM_URI]);
            }
            else {
                for(var i=0;i<promise.length;i++) {
                    var nft = promise[i].nft;
                    var lastServeTimeString = promise[i].lastServeTimeString;
                    var lastServeTimeMS = promise[i].lastServeTimeMS;
                    var amountLeft = promise[i].amountLeft;
                    debug.log(`nft [${nft}] was last served on [${lastServeTimeString}] and has [${amountLeft}] left to mine`);
                }
            }

        } else {
            debug.log(`database booted with an error!`);
        }
    } catch(err) {
        debug.error(err);
    }

    //  Deploy blockchain Listeners
    debug.log(`...deploying blockchain listeners`);
    var consumerContract = "0x4d4807e5154a694Aa87F8EbfefDcB1080b1aAa79";
    var filter = new eventlisteners.Filter(consumerContract, "ChainlinkRequested(bytes32)");
    eventlisteners.EventChainlinkRequested(filter);

    var filter = new eventlisteners.Filter(consumerContract, "ChainlinkFulfilled(bytes32)");
    eventlisteners.EventChainlinkFulfilled(filter, io);

    //  Run the server logic
    serve().catch(error => {
        debug.error(error);
    });
}

async function serve() {

/*     server.listen(port, async function serve() {
        console.log(``);
        debug.log(`Listening on port...> ${port}`);
        console.log(``);
    }); */

    app.post('/users', async function return_id_and_nft(req, res) {

        //  chainlink node is calling the Users table for the Users id and NFT values
        if (req.body.address) {
            debug.log(`CHAINLINK NODE is requesting the Users ID and NFT`);

            var result = await db.Query(`SELECT id, nft FROM users WHERE address=?`, [req.body.address]);

            debug.log(result[0]);

            //  address is not in the Users table
            if (result.length === 0) {
                res.send('this address is not signed in');
            }
            //  address was in the Users table, return an object containing the ID and NFT
            else {
                res.json(result[0]);
            }
        }

    });

    app.get('/users', async function return_users(req, res) {
        
        //  requesting the users table
        if (req.url === "/users") {
            var query = await db.Query('SELECT address, id, nft, requestID FROM users');
            res.send(query);
        }

    });

    io.on('connection', async (client) => {

        client.on('login', async function socket_io_login(address) {

            //  check if this users already signed in
            var result = await db.Query(`SELECT * FROM users WHERE address=?`, [address]);

            //  let's sign this address in
            if (result.length === 0) {
                debug.log(`login: ${address}`);

                var result = await db.Query(`INSERT INTO users (address, id, nft, requestID) VALUES (?, ?, ?, ?)`, [address, client.id, -1, "-1"]);
            }
            //  this address is already signed in
            else {
                debug.log(`logging back in: ${address} with a new client id of ${client.id}`);

                await db.Query(`UPDATE users SET id=? WHERE address=?`, [client.id, address]);
            }

            client.join(client.id);

            var nft = await db.Query('SELECT nft FROM users WHERE address=?', [address]);


            var return_data = {
                clientID: client.id,
                nft: nft[0].nft,
                requestID: -1,
                userNFTamount: await tools.balanceOf(address),
                contractNFTamount: await tools.balanceOf(),
                seconds: await tools.getSecondsTillNextBlock()
            }

            client.emit('login', return_data);
        });

        client.on('logout', async function socket_io_logout() {
            debug.log(`User ${client.id} has logged out!`);

            await db.Query('DELETE FROM users WHERE id=?', [client.id]);

            client.emit('logout', true);
        });

        client.on('auth', async function socket_io_auth(access_token) {
            debug.log(`received Spotify Auth from ${client.id}`);
            await db.Query(`UPDATE users SET spotify_access_token=? WHERE id=?`, [access_token, client.id]);
        });

        client.on('requestID', async function socket_io_requestID(data) {
            await db.Query(`UPDATE users SET requestID=? WHERE address=?`, [String(data.requestID), data.address]);
        });

    });

    /* NFT Mining Logic
      --> lets say we have 300 in a collection
      --> we want them mined over a period of 60 days
      --> that results in around 5 NFTs mined a day
      --> every 4.8 hours an NFT is served to a User (regardless if they mint it or not)
    */

    async function mine() {
        let promise = await db.Query(`SELECT id, address, spotify_access_token, listened FROM users WHERE spotify_access_token != ""`);

        //  compare current time to last serve time
        var lastServeTimePromise = await db.Query(`SELECT lastServeTimeMS FROM nfts`);
        var mintTime = await tools.compareTimes(tools.getCurrentTimeMS(), lastServeTimePromise[0].lastServeTimeMS);

        for (var i=0;i<promise.length;i++) {
            var address = promise[i].address;
            var access_token = promise[i].spotify_access_token;
            var id = promise[i].id;
            try {
                var secondsUntilNextBlock = await tools.getSecondsTillNextBlock();
                debug.log(secondsUntilNextBlock);
                if (secondsUntilNextBlock > -1) {
                    io.to(id).emit("secondsUntilBlock", secondsUntilNextBlock);
                }
                var res = await music.getPlayingTrack(music.createSpotifyApi(access_token));
                if (res.body.is_playing) {
                    if (res.body.item != null) {
                        //debug.log(res.body);

                        var trackName = res.body.item.name;
                        var albumName = res.body.item.album.name;
                        var trackUri = res.body.item.uri;
                        var albumUri = res.body.item.album.uri;

/*                         var secondsUntilNextBlock = await tools.getSecondsTillNextBlock();
                        if (secondsUntilNextBlock > -1) {
                            io.to(id).emit("secondsUntilBlock", secondsUntilNextBlock);
                        } */

                        if (albumUri.includes(ALBUM_URI)) {
                            var currentAmount = await db.Query(`SELECT listened FROM users WHERE address=?`, [address]);
                            var newAmount = 0;
                            
                            //  First time listening to this album for this block
                            if (currentAmount[0].listened == null) {
                                newAmount = 1;
                            }
                            else {
                                newAmount = currentAmount[0].listened + 1;
                            }

                            await db.Query(`UPDATE users SET listened=? WHERE address=?`, [newAmount, address]);

                            debug.log(`address ${address} is currently mining for --> track: [${trackName}] from album: [${albumName}]`);
                        }

                    }
                }
            } catch(err) {
                debug.error(err);

                if (err.body && err.body.error && err.body.message) {
                    //  parse the error message, if the access_token is expired then send a request to the front-end app to do a Spotify Auth refresh
                    if (err.body.error.message == "The access token expired") {
                        debug.error(`The access token expired!`);
                        var clientPromise = await db.Query(`SELECT id FROM users WHERE address=?`, [address]);
                        var clientID = clientPromise[0].id;

                        io.to(clientID).emit("refreshAuth", {} );
                    }
                }
            }
        }

        //  it's time to serve an NFT to a User, let's weigh up everyones time and then serve an NFT to a random user!
        if (mintTime) {
            var array = [];

            for(var i=0;i<promise.length;i++) {
                var address = promise[i].address;
                var time = promise[i].listened;
                for(var t=0;t<time;t++) {
                    array.push([address, 1]);
                }
            }

            if (array.length != 0) {
                //  listening time has been weighed out... time to select our random winner and which NFT they won
                var length = array.length;
                var random = tools.getRandomInt(length);
                var winner = array[random][0];
                var nft = tools.getRandomInt(3);

                debug.log(`address ${address} just won nft: ${nft}`);

                //  flip their NFT value from -1 to one of 3
                await db.Query(`UPDATE users SET nft=? WHERE address=?`, [nft, winner]);

                //  set last serve time to current time
                await db.Query(`UPDATE nfts SET lastServeTimeMS=?, lastServeTimeString=?`, [tools.getCurrentTimeMS(), tools.getCurrentTimeString()]);

                //  reset everyones listening time back to 0
                await db.Query(`ALTER TABLE users DROP COLUMN listened`);
                await db.Query(`ALTER TABLE users ADD COLUMN listened INT DEFAULT 0`);

                //  message the front-end that this User won an NFT
                var clientPromise = await db.Query(`SELECT id FROM users WHERE address=?`, [winner]);

                io.to(`${clientPromise[0].id}`).emit("serveNFT", {
                    nft: nft
                });
            }

        }
    }
    setInterval(mine, 1000);

}

main().catch(error => {
    debug.error(error);
});
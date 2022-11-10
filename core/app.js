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
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert")
}
const httpolyglot = require('httpolyglot');
const server = httpolyglot.createServer(options, app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

const version = pson.version;
const mode = 'DEVELOP';
const port = 8080;

let users = 0;

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
        } else {
            debug.log(`database booted with an error!`);
        }
    } catch(err) {
        debug.error(err);
    }

    //  Deploy blockchain Listeners
    debug.log(`...deploying blockchain listeners`);
    var consumerContract = "0x0d81E7f628282Ba4e7df2c89E5108eC75a482b35";
    var filter = new eventlisteners.Filter(consumerContract, "ChainlinkRequested(bytes32)");
    eventlisteners.EventChainlinkRequested(filter);

    var filter = new eventlisteners.Filter(consumerContract, "ChainlinkFulfilled(bytes32)");
    eventlisteners.EventChainlinkFulfilled(filter);

    //  Run the server logic
    await serve();
}

async function serve() {

    server.listen(port, async function serve() {
        console.log(``);
        debug.log(`Listening on port...> ${port}`);
        console.log(``);
    });

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
                debug.log(`logging back in: ${address}`);

                await db.Query(`UPDATE users SET id=? WHERE address=?`, [client.id, address]);
            }

            var return_data = {
                clientID: client.id,
                nft: -1,
                requestID: -1,
                userNFTamount: await tools.balanceOf(address),
                contractNFTamount: await tools.balanceOf(),
            }

            client.emit('login', return_data);
        });

        client.on('logout', async function socket_io_logout() {
            debug.log(`User ${client.id} has logged out!`);

            await db.Query('DELETE FROM users WHERE id=?', [client.id]);

            client.emit('logout', true);
        });

        client.on('auth', async function socket_io_auth(access_token) {
            await db.Query(`UPDATE users SET spotify_access_token=? WHERE id=?`, [access_token, client.id]);
        });

        client.on('start', async function socket_io_start(trackUri) {
            debug.log(`User ${client.id} has started listening to ${trackUri}`);

            //  set a new id for the User
            //await db.Query(`UPDATE users SET id=? WHERE address=?`, [client.id, address]);

            //var rooms = io.of(`/time-room`).adapter.rooms;
            //var sids = io.of(`/`).adapter.sids;

            //debug.log(rooms);
            //debug.log(sids);

            client.join(`${trackUri}`);

            client.emit('start');
        });

        client.on('stop', async function socket_io_stop(trackUri) {
            debug.log(`User ${client.id} has stopped listening to ${trackUri}`);
            
            //  clear the Users id
            // await db.Query('UPDATE users SET id=? WHERE id=?', [-1, client.id]);

            client.leave(`${trackUri}`);

            client.emit('stop');
        });

    });

    /* NFT Mining Logic
      --> lets say we have 300 in a collection
      --> we want them mined over a period of 60 days
      --> that results in around 5 NFTs mined a day
      --> every 4.8 hours an NFT is served to a User (regardless if they mint it or not)
    */

    async function mine() {
        var promise = await db.Query(`SELECT address, spotify_access_token FROM users WHERE spotify_access_token != ""`);
        for(var i=0;i<promise.length;i++) {
            var address = promise[i].address;
            music.getPlayingTrack(address, music.createSpotifyApi(promise[i].spotify_access_token), io);
        }
    }
    setInterval(mine, 1000);

}

main();
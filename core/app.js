const ethers = require('ethers');
const dir = __dirname;
require('dotenv').config({path: dir + '/.env'});
const tools = require('./packages/tools.js');
const eventlisteners = require('./packages/eventlisteners.js');
const debug = require('./packages/debug.js');
const db = require('./packages/db.js');
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
const { balanceOf } = require('./packages/tools.js');
const server = httpolyglot.createServer(options, app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

const version = "0.0.001";
const mode = 'DEVELOP';
const port = 8080;
let users = 0;

async function main() {
    debug.log(`...> running version ${version} in ${mode}`);
    debug.section(`=====     WELCOME TO TIME     =====`, `\x1b[32m%s\x1b[0m`);

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

    app.get(`/`, async function serve_webpage(req, res) {
        res.sendFile(path.join(__dirname, "../", "web", "public", "index.html"));
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
            var query = await db.Query('SELECT * FROM users');
            res.send(query);
        }

    });

    io.on('connection', async (client) => {

        client.on('login', async function socket_io_login(address) {

            //  check if this users already signed in
            var result = await db.Query(`SELECT * FROM users WHERE address=?`, [address]);

            //  let's sign this address in
            if (result.length === 0) {
                debug.log(`this User is not signed in`);
                debug.log(`new Users address: ${address}`);
                debug.log(`client_id: ${client.id}`);

                var result = await db.Query(`INSERT INTO users (address, id, nft, requestID) VALUES (?, ?, ?, ?)`, [address, client.id, -1, "-1"]);
                debug.log(`this User was successfully signed in`);
            }
            //  this address is already signed in
            else {
                debug.log(`this User is signed in`);

                await db.Query(`UPDATE users SET id=? WHERE address=?`, [client.id, address]);
            }
            users = users + 1;

            var return_data = {
                clientID: client.id,
                nft: -1,
                requestID: -1,
                userNFTamount: await balanceOf(address),
                contractNFTamount: await balanceOf(),
            }

            //debug.log(return_data);

            client.emit('login', return_data);
        });

        client.on('logout', async function socket_io_logout() {
            debug.log(`User ${client.id} has logged out!`);

            //var result = await db.Query('UPDATE users SET nft=? WHERE id=?', [-1, client.id]);
            await db.Query('DELETE FROM users WHERE id=?', [client.id]);

            users = users - 1;

            client.emit('logout', true);
        });

        client.on('start', async function socket_io_start(address) {
            debug.log(`User ${client.id} has started!`);

            //  set a new id for the User
            await db.Query(`UPDATE users SET id=? WHERE address=?`, [client.id, address]);

            users = users + 1;
        });

        client.on('stop', async function socket_io_stop() {
            debug.log(`User ${client.id} has stopped!`);
            
            //  clear the Users id
            await db.Query('UPDATE users SET id=? WHERE id=?', [-1, client.id]);

            users = users - 1;
        });

    });

    async function mine() {
        //debug.log(`...> mining`);
    }
    setInterval(mine, 1000);

}

main();
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
const server = httpolyglot.createServer(options, app);

const version = "0.0.001";
const mode = 'DEVELOP';
const port = 8080;

async function main() {
    debug.log(`...> running version ${version} in ${mode}`);
    debug.section(`=====     WELCOME TO TIME     =====`, `\x1b[32m%s\x1b[0m`);

    //  db boot sequence
    try {
        var bootResult = await db.boot();
        if (bootResult.error == false) {
            debug.log(`database booted without errors!`);
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

}

main();
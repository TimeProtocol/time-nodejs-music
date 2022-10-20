const ethers = require('ethers');
const express = require('express');
const fs = require('fs');
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

server.listen(port, () => {
    console.log(`Listening on port...> ${port}`);
});
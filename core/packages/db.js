//  db.js
//  =====

const mysql = require(`promise-mysql`);
const debug = require(`./debug.js`);

const gcloud = false;

let settings = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    socketPath: process.env.DB_SOCKETPATH,
    port: process.env.DB_PATH,
}

if (gcloud) delete settings.host;
else if (gcloud == false) delete settings.socketPath;

module.exports = {

    settings: settings,

    boot: async function() {

        var map = {
            error: false,
            err: -1,
            results: -1,
            users: 0
        }

        const table_create_query_users = `CREATE TABLE IF NOT EXISTS users (address TEXT, id TEXT, nft INT, requestID TEXT, spotify_access_token TEXT, listened INT)`;
        const table_create_query_nfts = `CREATE TABLE IF NOT EXISTS nfts (nft TEXT, lastServeTimeString TEXT, lastServeTimeMS BIGINT, nextServeTimeMS BIGINT, amountStarted INT, amountLeft INT, daysToMine DECIMAL(2, 2) )`;

        //  Let's try to connect to the sql server using the default settings
        try {
            debug.log(`...establishing connection to the sql server using default settings`);

            var connection = await mysql.createPool(this.settings);
            var promise = await connection.query(`SELECT * FROM users`);
            await connection.end();

            var connection = await mysql.createPool(this.settings);
            var promise = await connection.query(`SELECT * FROM nfts`);
            await connection.end();

            debug.log(`...successfully established connection to the sql server using default settings`);

            map.users = promise.length;

            return map;
        }

        //  Error with connecting to the sqlserver using default settings
        catch(err) {

            //debug.error(err);

            if ((err.code == `ER_BAD_DB_ERROR`) && (err.errno == 1049)) {
                debug.log(`!!! error with database`);

                try {

                    //  Let's create a new database 'db'
                    debug.log(`...attempting to create new database`);
                    var connection = await mysql.createPool({host: this.settings.host, user: this.settings.user, password: this.settings.password,  socketPath: this.settings.socketPath});
                    var dbPromise = await connection.query(`CREATE DATABASE IF NOT EXISTS ${settings.database}`);
                    await connection.end();
                    debug.log(`...successfully created new database 'db'`);

                    //  Let's create a new table USERS
                    debug.log(`...attempting to create new table USERS`);
                    var connection = await mysql.createPool(settings);
                    var tablePromise = await connection.query(table_create_query_users);
                    await connection.end();
                    debug.log(`...successfully created new table USERS`);

                    //  Let's create a new table NFTS
                    debug.log(`...attempting to create new table NFTS`);
                    var connection = await mysql.createPool(settings);
                    var tablePromise = await connection.query(table_create_query_nfts);
                    await connection.end();
                    debug.log(`...successfully created new table NFTS`);

                    //  Let's do a test Query why don't we
                    var results = await this.Query(`SELECT * FROM users`);
                    if ((typeof results == `object`) && (Object.keys(results).length === 0)) {
                        debug.log(`...test query successful`);
                    }

                    map.error = false;
                    map.err = err;
                    map.results = `new database and table USERS and NFTS were created!`;

                    return map;

                } catch(err) {
                    debug.error(err);
                    map.error = true;
                    map.err = err;
                    return map;
                }
            }

            else if (err.code == `ER_NO_SUCH_TABLE` && (err.errno == 1146)) {

                await this.Query(table_create_query_users);
                await this.Query(table_create_query_nfts);

                map.error = false;
                map.err = err;
                map.results = `new table USERS and NFTS created`;
                return map;
            }
        }
    },

    Query: async function(query, values=[]) {

        try {
            var connection = await mysql.createPool(settings);
            var promise = await connection.query(query, values);
            await connection.end();
            return promise;
        } catch(err) {
            debug.error(err);
        }

    },

}
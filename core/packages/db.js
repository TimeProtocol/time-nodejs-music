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
    socketPath: process.env.DB_SOCKETPATH
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
        }

        //  Let's try to connect to the sql server using the default settings
        try {
            debug.log(`...establishing connection to the sql server using default settings`);

            var connection = await mysql.createPool(this.settings);
            //debug.log(`...attempted pool connection: ${connection}`);
            //debug.log(connection);

            var promise = await connection.query(`SELECT * FROM users`);
            await connection.end();
            
            debug.log(`...successfully established connection to the sql server using default settings`);      

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
                    var tablePromise = await connection.query(`CREATE TABLE IF NOT EXISTS users (address TEXT, id TEXT, nft INT, requestID TEXT)`);
                    await connection.end();
                    debug.log(`...successfully created new table USERS`);

                    //  Let's do a test Query why don't we
                    var results = await this.Query(`SELECT * FROM users`);
                    if ((typeof results == `object`) && (Object.keys(results).length === 0)) {
                        debug.log(`...test query successful`);
                    }

                    map.error = false;
                    map.err = err;
                    map.results = `new database and table USERS created!`;

                    return map;

                } catch(err) {
                    debug.error(err);
                    map.error = true;
                    map.err = err;
                    return map;
                }
            }

            else if (err.code == `ER_NO_SUCH_TABLE` && (err.errno == 1146)) {

                await this.Query(`CREATE TABLE IF NOT EXISTS users (address TEXT, id TEXT, nft INT, requestID TEXT)`);

                debug.log(`done creating table?`);

                map.error = false;
                map.err = 
                map.results = `new table USERS created`;
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
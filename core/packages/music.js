//  music.js
//  ========

const SpotifyWebApi = require('spotify-web-api-node');
const db = require('./db.js');
const debug = require(`./debug.js`);

module.exports = {

    createSpotifyApi: function(access_token) {
        var spotifyApi = new SpotifyWebApi({
            clientId : process.env.SPOTIFY_CLIENT_ID,
            clientSecret : process.env.SPOTIFY_CLIENT_SECRET
        });
        spotifyApi.setAccessToken(access_token);
        return spotifyApi;
    },

    getPlayingTrack: async function(address, spotifyApi, io) {
        if (spotifyApi.getAccessToken() != null) {
            if (spotifyApi.getMyCurrentPlayingTrack().then(res => {
                if (res.body.is_playing) {
                    //debug.log(res);
                    if (res.body.item != null) {
                        var trackName = res.body.item.name;
                        var trackUri = res.body.item.uri;
                        var albumUri = res.body.item.album.uri;
                        debug.log(`address ${address} is currently mining for --> ${trackName}`);
                        //debug.log(`albumUri: ${albumUri}`);
                        //return res;
                    }
                }
            }).catch(async (err) => {
                debug.error(err);
                //  parse the error message, if the access_token is expired then send a request to the front-end app to do a Spotify Auth refresh
                if (err.body.error.message == "The access token expired") {
                    var promise = await db.Query(`SELECT id FROM users WHERE address=?`, [address]);
                    var clientID = promise[0].id;
                    //debug.log(clientID);
                    io.on('connection', async (clientID) => {
                        clientID.emit("refreshAuth", {} );
                        await db.Query(`UPDATE users SET spotify_access_token=? WHERE address=?`, ["", address]);
                    });
                }

            }));
        }
    }
}
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

    getPlayingTrack: async function(spotifyApi) {
        if (spotifyApi.getAccessToken() != null) {
            return spotifyApi.getMyCurrentPlayingTrack();
        }
    },
    
}
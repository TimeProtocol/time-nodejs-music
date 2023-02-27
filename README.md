# Time Node with the Music Mining Mechanism


## Contains an alpha version of the TIME Node which is a layer in-between blockchain-based NFTs and any sort of external Application logic they can connect to.


## This specific example made for the 2022 Chainlink Fall Hackathon is built around the concept of Mechanized NFT Minting that is done through listening to music via an application. Think Mining for Bitcoin or Mining for Ether except instead of building a computer and using CPU or GPU power to mine, its the act of listening to music that mines for an artist or bands collectibles. Nearly everybody listens to music but not everybody mines cryptocurrency. Now everybody can.


# Installation:

 - Clone the entire repo
 - Run `npm build` to download the required packages
 - Make sure a SQL database software is installed (I am using MySQL for this)
 - Create a `.env` file in both `core/` and `web/`. Default `.env`'s are down below
 - Start the `web/` server by running `yarn start` in `web/`, it default runs on port 3000
 - Start the `core/` server by running `npm start` in `core/`, it default runs on port 8080
 - Head to `localhost:3000`, sign into your desired Web3 Wallet and then sign into your Spotify account
 - For Hackathon purposes the mineable album is hard coded in, it's [Avalanche by Boyan the Bard](https://open.spotify.com/album/6oYvjbrNIu0lA5QAi33K1q) (feel free to change, the variable is in `core/app.js line 34`)
 - For Hackathon purposes I set the mining speed to `144 seconds`. This is configurable in `core/app.js line 58`. Change the `daysToMine` line, last in the array, to how ever many estimated days you want the collection to take to be mined. `seconds = ((24 / (amountStarted / daysToMine)) * 60) * 60`
 - Grab some tea, play the Track on Spotify, sit back and listen to some tunes ♬♬♬♬♬`♬`

`core/.env`
```
ETHEREUM_NETWORK=""
INFURA_API_KEY=""
INFURA_ENDPOINT=""

SPOTIFY_CLIENT_ID="" (acquired from the Spotify Developer App dashboard)
SPOTIFY_CLIENT_SECRET="" (acquired from the Spotify Developer App dashboard)

DB_HOST=""
DB_PORT=""
DB_USER=""
DB_PASSWORD=""
DB_DATABASE=""
DB_SOCKETPATH="" (optional, needed if deploying to Google Cloud)
```

`web/.env`
```
REACT_APP_TIME_ENDPOINT="" (the URL:PORT of the core/ server)
REACT_APP_FRONTEND_ENDPOINT="" (the URL:PORT of the web/ server)
REACT_APP_SPOTIFY_CLIENT_ID="" (same as above)
REACT_APP_SPOTIFY_CLIENT_SECRET="" (same as above)
```

# See the [Pivotal Tracker](https://www.pivotaltracker.com/n/projects/2590526) to follow development progress.
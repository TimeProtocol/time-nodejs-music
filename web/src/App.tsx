import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import io from "socket.io-client";
import Login from "./Login";

const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);
const SpotifyWebApi = require('spotify-web-api-node');
const SpotifyWebApiServer = require('spotify-web-api-node/src/server-methods');
(SpotifyWebApi as unknown as { _addMethods: (fncs: unknown) => void })._addMethods(SpotifyWebApiServer);

function App() {
  const { address, isConnected } = useAccount();
  const [clientID, setClientID] = useState("");
  // replace with what gets returned from loging into spotify
  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("login", (data) => {
      console.log(data);
      setClientID(data.clientID);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("login");
    };
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      socket.emit("login", address);
    } else {
      socket.emit("logout");
      setClientID("");
    }
  }, [isConnected, address]);

  function LoginToSpotify() {
    var scopes = ['user-read-playback-state'];
    var spotifyApi = new SpotifyWebApi({
      clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
      redirectUri: process.env.REACT_APP_FRONTEND_ENDPOINT,
      //redirectUri: "http://localhost/"
    });
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
    window.open(authorizeURL);
  }

  function test() {
    var scopes = ['user-read-playback-state'];
    var spotifyApi = new SpotifyWebApi({
      clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
      redirectUri: process.env.REACT_APP_FRONTEND_ENDPOINT,
      //redirectUri: "http://localhost/"
    });
    console.log(spotifyApi.getAccessToken());
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 radial-bg">
      {address && isConnected && isSpotifyLoggedIn ? (
        <h1>logged in</h1>
      ) : (
        <Login loginToSpotify={loginToSpotify} clientID={clientID} />
      )}
      <div className="flex justify-center">
      <ConnectButton />
      </div>

      <div className="button text-center">
        {clientID ? (
          <button onClick={LoginToSpotify}>Log into Spotify</button>
        ) : (
          <h1></h1>
        )}
      </div>

      <div className="button text-center">
          <button onClick={test}>test</button>
      </div>
           
    </div>
  );
}

export default App;
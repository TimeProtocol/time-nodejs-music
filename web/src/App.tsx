import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import io from "socket.io-client";
import Login from "./Login";
import Player from "./Player";
const SpotifyWebApi = require('spotify-web-api-node');

const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);

const code = new URLSearchParams(window.location.search);
const access_token = new URLSearchParams(window.location.hash).get('#access_token');
const token_type = new URLSearchParams(window.location.hash).get('token_type');
const expires_in = new URLSearchParams(window.location.hash).get('expires_in');

function App() {
  const { address, isConnected } = useAccount();
  const [clientID, setClientID] = useState("");

  ////  socket.io
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("login", (data) => {
      //console.log(data);
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


  ////  spotify
  function Spotify() {
    if (access_token) {
      console.log(access_token);
      console.log(token_type);
      console.log(expires_in);
      const spotifyApi = new SpotifyWebApi({
        redirectUri : process.env.REACT_APP_FRONTEND_ENDPOINT,
        clientId : process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        clientSecret : process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
      });
      spotifyApi.setAccessToken(access_token);
      spotifyApi.getAlbum('6oYvjbrNIu0lA5QAi33K1q').then((data: Object) => {
        console.log(data);
      });
      spotifyApi.getMyDevices().then((data: any) => {
        let deviceID = data.body.devices[0].id;
        console.log(deviceID);
        //console.log(data.body.devices[0].id);
        spotifyApi.getMyCurrentPlayingTrack().then((data: any) => {
          var URI = data.body.item.uri;
          //console.log(data.body.item.uri);
          //spotifyApi.play();
          //spotifyApi.pause();
        });
      });
      window.history.pushState({}, "", "/");
    }
  }

  function LoginToSpotify() {
    var scopes = ['streaming', 'user-read-email', 'user-read-private', 'user-library-read', 'user-library-modify', 'user-read-playback-state', 'user-modify-playback-state'];
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    url += '&redirect_uri=' + process.env.REACT_APP_FRONTEND_ENDPOINT;
    url += '&scope=' + scopes;
    window.location.replace(url);
  }



  ////  main page
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 radial-bg">
      {address && isConnected && access_token ? (
        <Player Spotify={Spotify} SongURL={''} />
      ) : (
        <Login LoginToSpotify={LoginToSpotify} clientID={clientID} />
      )}
    </div>
  );
}

export default App;
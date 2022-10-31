import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import io from "socket.io-client";
import Login from "./Login";
import Player from "./Player";
const SpotifyWebApi = require('spotify-web-api-node');

const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);

let code = new URLSearchParams(window.location.hash).get('#access_token');
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
  const [loggedIn, setLoggedIn] = useState(false);
  let tracks: any[] = [];
  const [playingTrack, setPlayingTrack] = useState("");
  const [trackImage, setTrackImage] = useState("");

  //function chooseTrack(track: string) {
    //setPlayingTrack(track);
  //}

  function Spotify() {
    if (access_token) {
      //console.log(access_token);
      //console.log(token_type);
      //console.log(expires_in);
      const spotifyApi = new SpotifyWebApi({
        redirectUri : process.env.REACT_APP_FRONTEND_ENDPOINT,
        clientId : process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        clientSecret : process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
      });
      spotifyApi.setAccessToken(access_token);
      spotifyApi.getAlbum('6oYvjbrNIu0lA5QAi33K1q').then((data: any) => {
        //console.log(data.body.images[0].url);
        //setTrackImage(data.body.images[0].url);
        //console.log(data.body.tracks.items.length);
        //console.log(data.body.tracks.items);
        for(const index in data.body.tracks.items) {
          var uri = data.body.tracks.items[index].uri;
          tracks.push(uri);
          //tracks[i] = data.body.tracks.items[i].uri;
        }
        //setTracks(data.body.tracks.items);
        console.log(tracks);
      });
      spotifyApi.getMyDevices().then((data: any) => {
        let deviceID = data.body.devices[0].id;
        //console.log(deviceID);
        //console.log(data.body.devices[0].id);
        spotifyApi.getMyCurrentPlayingTrack().then((data: any) => {
          console.log(data.body.item.album.images[0].url);
          setTrackImage(data.body.item.album.images[0].url);
          var URI = data.body.item.uri;
          //console.log(URI);
          setPlayingTrack(URI);
          //console.log(data.body.item.uri);
          //spotifyApi.play();
          //spotifyApi.pause();
        });
      });
    }
  }

  useEffect(() => {
    if (access_token === code) {
      window.history.pushState({}, "", "/");
      console.log(code);
      console.log(access_token);
      console.log(loggedIn);
      setLoggedIn(true);
      code = new URLSearchParams(window.location.hash).get('#access_token');
      Spotify();
    }
  });

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
      {address && isConnected && tracks && code == null && access_token ? (
        <Player access_token={access_token} trackUri={tracks[0]} trackImage={trackImage} socket={socket} />
      ) : (
        <Login LoginToSpotify={LoginToSpotify} clientID={clientID} />
      )}
    </div>
  );
}

export default App;
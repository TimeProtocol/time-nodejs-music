import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import io from "socket.io-client";
import Login from "./Login";

const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);

function App() {
  const { address, isConnected } = useAccount();
  const [clientID, setClientID] = useState("");
  // replace with what gets returned from logging into Spotify
  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");

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
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    url += '&redirect_uri=' + process.env.REACT_APP_FRONTEND_ENDPOINT;
    window.location.replace(url);
  }

  function listTracks() {

  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 radial-bg">
      {address && isConnected && isSpotifyLoggedIn ? (
        <h1>logged in</h1>
      ) : (
        <Login LoginToSpotify={LoginToSpotify} clientID={clientID} />
      )}
    </div>
  );
}

export default App;
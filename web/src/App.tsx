import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import io from "socket.io-client";
import Login from "./Login";

const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);
const SpotifyWebApi = require("spotify-web-api-node");

console.log(process.env.REACT_APP_TIME_ENDPOINT);

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

  function loginToSpotify() {
    var spotifyApi = new SpotifyWebApi();
    console.log(spotifyApi);
    console.log(spotifyApi.getAccessToken());
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 radial-bg">
      {address && isConnected && isSpotifyLoggedIn ? (
        <h1>logged in</h1>
      ) : (
        <Login loginToSpotify={loginToSpotify} clientID={clientID} />
      )}
    </div>
  );
}

export default App;

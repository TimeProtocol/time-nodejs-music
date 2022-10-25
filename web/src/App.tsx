import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import io from "socket.io-client";

import Login from "./Login";

const socket = io("http://localhost:5001");

function App() {
  const { address, isConnected } = useAccount();
  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      socket.emit("login", address);
    } else {
      socket.emit("logout");
    }
  }, [isConnected, address]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 radial-bg">
      {address && isConnected && isSpotifyLoggedIn ? (
        <h1>logged in</h1>
      ) : (
        <Login setIsSpotifyLoggedIn={setIsSpotifyLoggedIn} />
      )}
    </div>
  );
}

export default App;

import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import io from "socket.io-client";
const socket = io("http://localhost:5001");

function App() {
  const { address, isConnected } = useAccount();

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
    <div>
      {address ? (
        <h1 className="text-xl">welcome: {address}</h1>
      ) : (
        <h1>Connect</h1>
      )}
      <ConnectButton />
    </div>
  );
}

export default App;

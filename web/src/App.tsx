import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import io from "socket.io-client";
const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);

function App() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("login", (data) => {
      console.log(data);
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
    }
  }, [isConnected, address]);

  return (
    <div>
      {address ? (
        <h1 className="text-xl text-center">welcome: {address}</h1>
      ) : (
        <h1 className="connect text-center">Connect</h1>
      )}
      <div className="flex justify-center">
      <ConnectButton />
      </div>
    </div>
  );
}

export default App;

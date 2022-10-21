import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function App() {
  const { address } = useAccount();

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

import React from "react";
import ReactDOM from "react-dom/client";
import loMerge from "lodash/merge";
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
// import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { infuraProvider } from "wagmi/providers/infura";

import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    infuraProvider({ apiKey: process.env.INFURA_ENDPOINT }),
    publicProvider(),
    jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) }),
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const IKTheme = loMerge(darkTheme(), {
  colors: {
    accentColor: "#3FCCBB",
    connectButtonBackground: "#354161",
    modalBackground: "#101D42",
    modalBorder: "rgba(255,255,255,.2)",
    menuItemBackground: "#101D42",
  },
  fonts: {
    body: "Poppins, sans-serif",
  },
  radii: {
    connectButton: "4px",
    modal: "8px",
    modalMobile: "8px",
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains} theme={IKTheme}>
      {/* <React.StrictMode> */}
      <App />
      {/* </React.StrictMode> */}
    </RainbowKitProvider>
  </WagmiConfig>
);

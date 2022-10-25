import { ConnectButton } from "@rainbow-me/rainbowkit";
import clsx from "clsx";

interface LoginProps {
  loginToSpotify: () => void;
  clientID: string;
}

function Login({ loginToSpotify, clientID }: LoginProps) {
  return (
    <div className="bg-black/30 py-20 px-10 w-full max-w-xl text-center border border-turquoise/50 rounded-md drop-shadow-2xl">
      <div className="mb-12">
        <p className="mb-4 font-bold text-2xl">Login with your wallet</p>
        <div className="flex justify-center">
          <ConnectButton accountStatus="address" showBalance={false} />
        </div>
      </div>

      <div>
        <p className="mb-4 font-bold text-2xl">
          Login with your Spotify account
        </p>
        <button
          onClick={loginToSpotify}
          disabled={!clientID}
          className={clsx(
            "inline-block border rounded text-center transition text-white py-2 px-4 text-base font-bold",
            clientID
              ? "border-[#1DB954] bg-[#1DB954] hover:border-white"
              : "border-gray-300 bg-gray-300"
          )}
        >
          Connect Spotify
        </button>
      </div>
    </div>
  );
}

export default Login;

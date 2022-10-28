import { ConnectButton } from "@rainbow-me/rainbowkit";
import clsx from "clsx";

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=a295e53c70b5400ba50a4e54a64f4ed3&response_type=code&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state`;

function Login({ loginToSpotify, address }) {
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

        <a
          href={address && AUTH_URL}
          className={clsx(
            "inline-block border rounded text-center transition text-white py-2 px-4 text-base font-bold",
            address
              ? "border-[#1DB954] bg-[#1DB954] hover:border-white"
              : "border-gray-300 bg-gray-300"
          )}
        >
          Login With Spotify
        </a>
      </div>
    </div>
  );
}

export default Login;

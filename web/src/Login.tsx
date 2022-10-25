import { ConnectButton } from "@rainbow-me/rainbowkit";

interface LoginProps {
  setIsSpotifyLoggedIn: (b: boolean) => void;
}

function Login({ setIsSpotifyLoggedIn }: LoginProps) {
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
          onClick={() => setIsSpotifyLoggedIn(true)}
          className="inline-block border border-turquoise hover:border-white rounded text-center transition text-white hover:text-blue bg-[#1DB954] py-2 px-4 text-base font-bold"
        >
          Connect Spotify
        </button>
      </div>
    </div>
  );
}

export default Login;

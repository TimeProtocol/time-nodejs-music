import { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import io from "socket.io-client";
const socket = io(`${process.env.REACT_APP_TIME_ENDPOINT}`);

export default function Player({ accessToken, trackUri }) {
  const [play, setPlay] = useState(false);

  const handleClick = () => {
    if (play) socket.emit("stop");
    socket.emit("start");
  };

  useEffect(() => {
    if (trackUri) socket.emit("start");
  }, [trackUri]);

  useEffect(() => {
    socket.on("start", () => setPlay(true));
    socket.on("stop", () => setPlay(false));

    return () => {
      socket.off("start");
      socket.off("stop");
    };
  }, []);

  if (!accessToken) return null;
  return (
    <div className="relative">
      <SpotifyPlayer
        token={accessToken}
        showSaveIcon
        play={play}
        uris={trackUri ? [trackUri] : []}
        callback={(state) => {
          console.log("state: ", state);
        }}
      />
      {trackUri && (
        <button
          onClick={handleClick}
          className="text-black absolute bottom-2 right-1/2 translate-x-1/2"
        >
          {play ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
    </div>
  );
}

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8"
  >
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
      clipRule="evenodd"
    />
  </svg>
);

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8"
  >
    <path
      fillRule="evenodd"
      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
      clipRule="evenodd"
    />
  </svg>
);

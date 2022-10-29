interface PlayerProps {
    Spotify: () => void;
    SongURL: string;
}

function Player({ Spotify, SongURL }: PlayerProps ) {
    return (
    <div className="bg-black/30 py-20 px-10 w-full max-w-xl text-center border border-turquoise/50 rounded-md drop-shadow-2xl">
      <div className="mb-12"></div>

        <iframe
              style={{ borderRadius: "12px" }}
              src="https://open.spotify.com/embed/album/6oYvjbrNIu0lA5QAi33K1q?utm_source=generator"
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
        ></iframe>

      </div>
    );
}

export default Player;
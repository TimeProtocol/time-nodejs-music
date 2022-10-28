import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import TrackSearchResult from "./TrackSearchResult";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

const ALBUM_URI = "6oYvjbrNIu0lA5QAi33K1q";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [albumData, setAlbumData] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();

  function chooseTrack(track) {
    setPlayingTrack(track);
  }

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.getAlbum(ALBUM_URI).then((res) => {
      if (cancel) return;

      const data = res.body;
      const smallestAlbumImage = data.images.reduce((smallest, image) => {
        if (image.height < smallest.height) return image;
        return smallest;
      }, data.images[0]);

      setAlbumData(
        data.tracks.items.map((track) => {
          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [accessToken]);

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ overflowY: "auto" }}>
        {albumData.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </div>
  );
}

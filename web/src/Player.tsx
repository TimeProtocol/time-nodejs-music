import { useEffect, useState } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
const SpotifyWebApi = require('spotify-web-api-node');

interface PlayerProps {
    access_token: string;
    socket: any;
}

function Player({ access_token, socket }: PlayerProps ) {

    const [play, setPlay] = useState(false);
    const [trackImage, setTrackImage] = useState("");
    const [trackUri, setTrackUri] = useState("");

    const spotifyApi = new SpotifyWebApi({
        redirectUri : process.env.REACT_APP_FRONTEND_ENDPOINT,
        clientId : process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        clientSecret : process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
      });
    spotifyApi.setAccessToken(access_token);
    spotifyApi.getMyCurrentPlayingTrack().then((data: any) => {
        setTrackImage(data.body.item.album.images[0].url);
        setTrackUri(data.body.item.uri);
    });

    const handleClick = () => {
        if (play) {
            socket.emit("stop", trackUri);
        }
        else {
            socket.emit("start", trackUri);
        }
    };

    ////  socket.io
  useEffect(() => {
    socket.on("start", () => {
        setPlay(true);
    });
    socket.on("stop", () => {
        setPlay(false);
    });
  });

    useEffect(() => {
        //if (trackUri) socket.emit("start", trackUri);
    }, [trackUri]);

    return (
    <div>
        <div className="mb-6">
            <img src={trackImage} />
        </div>

        {
            <div className="relative">
                <SpotifyPlayer 
                    token={access_token}
                    showSaveIcon
                    callback={state => {
                        if (state.track.uri != trackUri) {
                            spotifyApi.getMyCurrentPlayingTrack().then((data: any) => {
                                setTrackImage(data.body.item.album.images[0].url);
                                setTrackUri(state.track.uri);
                            });
                        }
                    }}
                    play={play}
                    uris={trackUri ? trackUri : ""}
                    styles={{
                        activeColor: '#fff',
                        bgColor: '#333',
                        color: '#abc'
                    }}
                />
            </div>
        }
        <div>
            <button onClick={handleClick}>Play</button>
        </div>
    </div>
    );
}

export default Player;
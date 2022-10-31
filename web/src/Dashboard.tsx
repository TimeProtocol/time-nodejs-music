import { useState, useEffect } from "react";
import Player from "./Player";
const SpotifyWebApi = require('spotify-web-api-node');

const ALBUM_URI = "6oYvjbrNIu0lA5QAi33K1q";

interface DashboardProps {
    access_token: string;
    socket: any;
}

function Dashboard({ access_token, socket }: DashboardProps) {

    const [trackUri, setTrackUri] = useState("");
    //const [albumData, setAlbumData] = useState([]);
    let albumData : Object;

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    });
    spotifyApi.setAccessToken(access_token);

    useEffect(() => {
        //if (albumData.length === 0) {
            spotifyApi.getAlbum(ALBUM_URI).then((res: any) => {
                albumData = res.body;
                console.log(`albumData:`);
                console.log(albumData);
            });
            spotifyApi.getMyCurrentPlayingTrack().then((res: any) => {
                console.log(res);
                //setPlayingTrack
            });
        //}
    });

    return (
        <div className="bg-black/30 py-20 px-10 w-full max-w-xl text-center border border-turquoise/50 rounded-md drop-shadow-2xl">
{/*            <div>
                {albumData.images[0]}
            </div> */}
            <Player access_token={access_token} trackUri={trackUri} socket={socket} />
        </div>
    );

}

export default Dashboard;
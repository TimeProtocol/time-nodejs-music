import { useState, useEffect } from "react";
import Player from "./Player";
import image1 from "./assets/MesoNFT01L1.jpg";
import image2 from "./assets/MesoNFT01L2.jpg";
import image3 from "./assets/MesoNFT01L3.jpg";

const SpotifyWebApi = require("spotify-web-api-node");
const ALBUM_URI = "6oYvjbrNIu0lA5QAi33K1q";

interface DashboardProps {
    access_token: string;
    socket: any;
}

function Dashboard({ access_token, socket }: DashboardProps) {

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
            });
        //}
    });

  return (
    <>
      <div className="bg-black/30 mt-16 py-20 px-10 w-full max-w-xl text-center border border-turquoise/50 rounded-md drop-shadow-2xl">
        {/*            <div>
                    {albumData.images[0]}
                </div> */}
        <Player access_token={access_token} socket={socket} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 my-16">
        {images.map((image, i) => (
          <div className=" bg-black/30 p-4 w-full max-w-sm text-center  border-turquoise/50 rounded-md drop-shadow-2xl">
            <img src={image} key={i} alt="" />
          </div>
        ))}
      </div>
    </>
  );
}

export default Dashboard;

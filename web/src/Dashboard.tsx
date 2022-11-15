import { useState, useEffect } from "react";
import Player from "./Player";
import image1 from "./assets/MesoNFT01L1.jpg";
import image2 from "./assets/MesoNFT01L2.jpg";
import image3 from "./assets/MesoNFT01L3.jpg";
import clsx from "clsx";
import { ethers } from "ethers";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const SpotifyWebApi = require("spotify-web-api-node");
const ALBUM_URI = "6oYvjbrNIu0lA5QAi33K1q";

interface DashboardProps {
    access_token: string;
    socket: any;
    address: string,
    id: string,
    nft: any;
}

function Dashboard({ access_token, socket, nft, address, id }: DashboardProps) {

    let albumData : Object;
    const [trackUri, setTrackUri] = useState("");

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    });
    spotifyApi.setAccessToken(access_token);

    useEffect(() => {
        //if (albumData.length === 0) {
            spotifyApi.getAlbum(ALBUM_URI).then((res: any) => {
                albumData = res.body;
                //console.log(`albumData:`);
                //console.log(albumData);
            });
            spotifyApi.getMyCurrentPlayingTrack().then((res: any) => {
                //console.log(res);
                setTrackUri(res.body.item.uri);
            });
        //}
    });

    async function mint() {
        const abi = ["function mintNFT(string _address, string _clientId) public returns (bytes32)"];

        var MetaMask : any = window.ethereum;

        var provider = new ethers.providers.Web3Provider(MetaMask);
        var signer = provider.getSigner();

        var nft_address = "0x0d81E7f628282Ba4e7df2c89E5108eC75a482b35";

        var contract = new ethers.Contract(nft_address, abi, provider);
        var nftWithSigner = contract.connect(signer);

        try {
            console.log(nftWithSigner);
            console.log(window.ethereum);
            var requestID = await nftWithSigner.mintNFT(address, id);
        } catch(error) {
            console.log(error);
        }

    }

    const images = [image1, image2, image3];
    
    return (
    <>
        <div className="bg-black/30 mt-16 py-20 px-10 w-full max-w-xl text-center border border-turquoise/50 rounded-md drop-shadow-2xl">
            <Player access_token={access_token} trackUri={trackUri} socket={socket} />
        </div>

        <div className="mt-12">
            {nft && (
                <button
                    onClick={mint}
                    className={clsx(
                        "inline-block border rounded text-center transition text-white py-2 px-4 text-base font-bold bg-turquoise border-turquoise min-w-[10rem]"
                    )}
                >
                Mint NFT
                </button>
            )}
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

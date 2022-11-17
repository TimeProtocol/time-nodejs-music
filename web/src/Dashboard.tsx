import { useState, useEffect } from "react";
import Player from "./Player";
import NFT from "./NFT";
import image1 from "./assets/MesoNFT01L1.jpg";
import image2 from "./assets/MesoNFT01L2.jpg";
import image3 from "./assets/MesoNFT01L3.jpg";
import { ethers } from "ethers";

const SpotifyWebApi = require("spotify-web-api-node");
const ALBUM_URI = "6oYvjbrNIu0lA5QAi33K1q";

interface DashboardProps {
    access_token: string;
    socket: any;
    address: string,
    id: string,
    nftBool: boolean;
    nft: any;
}

function Dashboard({ access_token, socket, nftBool, nft, address, id }: DashboardProps) {

    let albumData : Object;
    const [trackUri, setTrackUri] = useState("");
    const [requestID, setRequestID] = useState(false);

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    });
    spotifyApi.setAccessToken(access_token);

    useEffect(() => {
        socket.on(`requestID`, () => {
            setRequestID(false);
        });
    });

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

        var timelock_address = "0x4d4807e5154a694Aa87F8EbfefDcB1080b1aAa79";

        var contract = new ethers.Contract(timelock_address, abi, provider);
        var nftWithSigner = contract.connect(signer);

        try {
            var requestID = await nftWithSigner.mintNFT(address, id);
            setRequestID(true);
            socket.emit("requestID", {
                address: address,
                requestID: requestID.hash,
            });
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
            {requestID ? (
                <div className="loader"></div>
            ) : (
                <NFT mint={mint} nft={nft} nftBool={nftBool} images={images} />
            )}
{/*             {nftBool ? (
                <div className=" text-center">
                    <button
                        onClick={mint}
                        className={clsx(
                            "inline-block border rounded text-center transition text-white py-2 px-4 text-base font-bold bg-turquoise border-turquoise min-w-[10rem]"
                        )}
                    >
                    Mint NFT
                    </button>
                    <img className="my-16" src={images[nft]} width="400" alt="" />
                </div>
            ) : (
                <img src={images[nft]} alt = ""/>
            )} */}
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

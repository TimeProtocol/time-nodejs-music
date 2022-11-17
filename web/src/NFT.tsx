import { clsx } from "clsx";

interface nftProps {
    mint: () => void;
    nft: any;
    nftBool: boolean;
    images: any;
}

function drawNFT( { mint, nftBool, nft, images }: nftProps) {
    return (
        <div>
            {nftBool ? (
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
                <div>
                    <img src={images[nft]} width="400" alt = ""/>
                </div>
            )}
        </div>
    )
}

export default drawNFT;
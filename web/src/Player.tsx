import { useEffect, useState } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
import { Container, Form } from 'react-bootstrap'; 
import { debug } from 'console';

interface PlayerProps {
    access_token: string;
    trackUri: any;
    trackImage: string;
}

function Player({ access_token , trackUri, trackImage }: PlayerProps ) {

    const [play, setPlay] = useState(false);
    const [search, setSearch] = useState("");

    return (
    <div className="bg-black/30 py-20 px-10 w-full max-w-xl text-center border border-turquoise/50 rounded-md drop-shadow-2xl">
        <div className="mb-12">
            <div className="flex justify-center">
                <Container className="d-flex flex-column" style={{
                    height: "10vh",
                    color: "#fff",
                    }}>
                    <Form.Control 
                    type="search"
                    placeholder="Search" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} />
                </Container>
            </div>
        </div>

        <div className="mb-6">
            <img src={trackImage} />
        </div>
        {
            <SpotifyPlayer 
                token={access_token}
                showSaveIcon
                callback={state => {
                    console.log(state); 
                    if (!state.isPlaying) {
                        //setPlay(false)
                        console.log(`player turned off`);
                    }
                    else {
                        //setPlay(true);
                        console.log(`player turned on`);
                    }
                }}
                play={play}
                //uris={trackUri ? [trackUri] : []}
                uris={trackUri ? trackUri : ""}

                styles={{
                    activeColor: '#fff',
                    bgColor: '#333',
                    color: '#abc'
                }}
            />
        }
    </div>
    );
}

export default Player;
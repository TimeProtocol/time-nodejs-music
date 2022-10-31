import { useEffect, useState } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
import { Container, Form } from 'react-bootstrap'; 
import { debug } from 'console';

interface PlayerProps {
    access_token: string;
    trackUri: any;
    trackImage: string;
    socket: any;
}

function Player({ access_token , trackUri, trackImage, socket }: PlayerProps ) {

    const [play, setPlay] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        console.log(`player has changed state to ${play}`);
        if (play) {
            socket.emit('start');
        }
        else {
            socket.emit('stop');
        }
    }, [play]);

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
                        setPlay(false)
                    }
                    else {
                        setPlay(true);
                    }
                }}
                //play={play}
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
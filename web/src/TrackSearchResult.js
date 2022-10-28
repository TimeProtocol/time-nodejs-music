import React from "react";

export default function TrackSearchResult({ track, chooseTrack }) {
  function handlePlay() {
    chooseTrack(track);
  }

  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={handlePlay}
    >
      <img
        src={track.albumUrl}
        style={{ height: "32px", width: "32px" }}
        alt=""
      />
      <div className="ml-3">
        <div>
          {track.title} <span className="text-muted">{track.artist}</span>
        </div>
      </div>
    </div>
  );
}

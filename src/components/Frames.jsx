import React from "react";

//depending on number of frames they are rendered differently
function Frames() {
  return (
    <div id="videos">
      <video className="video-player" id="user-1" autoPlay playsInline></video>
      <video className="video-player" id="user-2" autoPlay playsInline></video>
      <video className="video-player" id="user-3" autoPlay playsInline></video>
      <video className="video-player" id="user-4" autoPlay playsInline></video>
      <video className="video-player" id="user-5" autoPlay playsInline></video>
      <video className="video-player" id="user-6" autoPlay playsInline></video>
      <video className="video-player" id="user-7" autoPlay playsInline></video>
    </div>
  );
}

export default Frames;



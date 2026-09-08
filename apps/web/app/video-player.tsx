"use client";

import { createPlayer } from "@videojs/react";
import { MinimalVideoSkin, Video, videoFeatures } from "@videojs/react/video";
import "@videojs/react/video/minimal-skin.css";

const Player = createPlayer({ features: videoFeatures });

export function VideoPlayer() {
  return (
    <Player.Provider>
      <MinimalVideoSkin poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
        <Video
          src="http://localhost:4000/uploads/895106c48b236d3ca6410af2f694b728_hls/master.m3u8"
          playsInline
        />
      </MinimalVideoSkin>
    </Player.Provider>
  );
}

"use client";

import LocalTetris from "@/components/local-tetris";
import Lobby from "@/components/lobby";

export default function Home() {
  // For now, using a default room ID - could be dynamic later
  const roomId = "default-room";

  return (
    <Lobby roomId={roomId}>
      <LocalTetris />
    </Lobby>
  );
}

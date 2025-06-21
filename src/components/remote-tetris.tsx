"use client";

import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";
import { useRemoteTetris, TetrisBoard } from "@/components/tetris";

interface RemoteTetrisProps {
  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  seed: number;
  targetUsername: string; // The username of the player this component is displaying
}

export default function RemoteTetris({ socket, seed, targetUsername }: RemoteTetrisProps) {
  const { game, username } = useRemoteTetris(socket, seed, targetUsername);
  return <TetrisBoard game={game} username={username} />;
}

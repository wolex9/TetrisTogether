"use client";

import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";
import { useLocalTetris, TetrisBoard } from "@/components/tetris";

interface LocalTetrisProps {
  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  seed: number;
}

export default function LocalTetris({ socket, seed }: LocalTetrisProps) {
  const { game, username } = useLocalTetris(socket, seed);
  return <TetrisBoard game={game} username={username} />;
}

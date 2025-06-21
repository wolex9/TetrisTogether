"use client";

import { useEffect } from "react";
import { useGame, type GameAction } from "@/tetris-game-oop";
import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

export function useRemoteTetris(
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined,
  seed: number,
  targetUsername: string,
) {
  const { game, dispatch } = useGame(seed);

  // Listen for game actions from socket and dispatch them
  useEffect(() => {
    if (!socket) return;

    // Handle game actions - only dispatch if the action is for this player
    const handleGameAction = (data: { username: string; action: GameAction }) => {
      if (data.username === targetUsername) {
        dispatch(data.action);
      }
    };

    socket.on("gameAction", handleGameAction);

    return () => {
      socket.off("gameAction", handleGameAction);
    };
  }, [socket, dispatch, targetUsername]);

  // Handle incoming garbage from socket for visual display
  useEffect(() => {
    if (!socket) return;

    const handleReceiveGarbage = (data: { lines: number; targetUsername: string }) => {
      // Only apply garbage if this remote player is the target
      if (data.targetUsername === targetUsername) {
        console.log(`Remote player ${targetUsername} receiving ${data.lines} garbage lines (visual display)`);
        dispatch({ type: "RECEIVE_GARBAGE", payload: { lines: data.lines } });
      }
    };

    socket.on("receiveGarbage", handleReceiveGarbage);

    return () => {
      socket.off("receiveGarbage", handleReceiveGarbage);
    };
  }, [socket, dispatch, targetUsername]);

  return { game, username: targetUsername };
}

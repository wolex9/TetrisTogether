"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces } from "@/components/tetris";
import { useGame, type GameAction } from "@/tetris-game-oop";
import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

interface RemoteTetrisProps {
  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  targetUsername: string; // The username of the player this component is displaying
  seed: number;
}

export default function RemoteTetris({ socket, targetUsername, seed }: RemoteTetrisProps) {
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

  // No keyboard controls or game loop - only responds to socket events

  return (
    <div className="flex min-w-fit flex-shrink-0 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{targetUsername}&apos;s Tetris</CardTitle>
        </CardHeader>
        <CardContent>
          <GameBoardComponent board={game.getDisplayBoard()} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <HoldPiece heldPiece={game.getHeldPiece()} canHold={game.canHoldPiece()} className="w-24" />
        <NextPieces nextPieces={game.getNextPieces()} className="w-24" />
      </div>
    </div>
  );
}

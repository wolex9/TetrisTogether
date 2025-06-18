"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces, GameInfo } from "@/components/tetris";
import { useGame, type GameAction } from "@/tetris-game-oop";
import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

interface RemoteTetrisProps {
  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  username?: string;
  seed: number;
}

export default function RemoteTetris({ socket, username = "Remote Player", seed }: RemoteTetrisProps) {
  const { game, dispatch, restartGame } = useGame(seed);

  // Listen for game actions from socket and dispatch them
  useEffect(() => {
    if (!socket) return;

    // GameAction type is inferred from socket events, but we keep explicit typing for clarity
    const handleGameAction = (action: GameAction) => {
      dispatch(action);
    };

    socket.on("gameAction", handleGameAction);

    return () => {
      socket.off("gameAction", handleGameAction);
    };
  }, [socket, dispatch]);

  // No keyboard controls or game loop - only responds to socket events

  return (
    <div className="flex gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{username}'s Tetris</CardTitle>
        </CardHeader>
        <CardContent>
          <GameBoardComponent board={game.getDisplayBoard()} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <HoldPiece heldPiece={game.getHeldPiece()} canHold={game.canHoldPiece()} className="w-24" />
        <NextPieces nextPieces={game.getNextPieces()} className="w-24" />
      </div>

      <GameInfo
        score={game.getScore()}
        lines={game.getLines()}
        seed={game.getSeed()}
        isPaused={game.isPausedState()}
        isGameOver={game.isGameOver()}
        onAction={() => {}} // No local actions allowed
        onRestart={() => {}} // No local restart allowed
      />
    </div>
  );
}

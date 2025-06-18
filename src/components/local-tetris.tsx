"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces, GameInfo } from "@/components/tetris";
import useKeyboardControls from "@/hooks/use-keyboard-controls";
import { useGame } from "@/tetris-game-oop";
import { useAuth } from "@/lib/auth-context";
import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

interface LocalTetrisProps {
  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  seed: number;
}

export default function LocalTetris({ socket, seed }: LocalTetrisProps) {
  const { user } = useAuth();
  const { game, dispatch, restartGame } = useGame(seed);

  // Add keyboard controls for local play with automatic game loop
  useKeyboardControls(dispatch, game);

  return (
    <div className="flex gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{user.username}'s Tetris</CardTitle>
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
        onAction={dispatch}
        onRestart={restartGame}
      />
    </div>
  );
}

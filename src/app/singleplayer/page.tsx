"use client";

import { useState } from "react";
import { useGame } from "@/tetris-game-oop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces, GameInfo } from "@/components/tetris";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SinglePlayerPage() {
  const { user } = useAuth();
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));
  const { game, dispatch, restartGame } = useGame(seed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Viens spēlētājs</h1>
          <Link href="/" className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            ← Atpakaļ
          </Link>
        </div>

        <div className="flex justify-center gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{user.username} spēle</CardTitle>
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
      </div>
    </div>
  );
}

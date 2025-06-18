"use client";

import { useState, useEffect, useRef } from "react";
import { useGame } from "@/tetris-game-oop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces, GameInfo } from "@/components/tetris";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SinglePlayerPage() {
  const { user } = useAuth();
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));
  const { game, dispatch, restartGame } = useGame(seed);

  // Keyboard controls state
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef<Record<string, number>>({});

  // Keyboard controls - one-time actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for game keys
      const gameKeys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "Shift", "z", "Z", "x", "X", "p", "P"];
      if (gameKeys.includes(e.key)) {
        e.preventDefault();
      }

      keysPressed.current.add(e.key);

      switch (e.key) {
        case "ArrowUp":
        case "x":
        case "X":
          dispatch({ type: "ROTATE_PIECE", payload: { clockwise: true } });
          break;
        case "z":
        case "Z":
          dispatch({ type: "ROTATE_PIECE", payload: { clockwise: false } });
          break;
        case " ":
          dispatch({ type: "HARD_DROP" });
          break;
        case "Shift":
          dispatch({ type: "HOLD" });
          break;
        case "p":
        case "P":
          dispatch({ type: "PAUSE" });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      delete lastMoveTime.current[e.key];
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dispatch]);

  // Keyboard controls - continuous movement
  useEffect(() => {
    const MOVE_DELAY = 100;
    const SOFT_DROP_DELAY = 50;

    const movementKeys = [
      {
        key: "ArrowLeft",
        action: () => dispatch({ type: "MOVE_PIECE", payload: { dx: -1, dy: 0 } }),
        delay: MOVE_DELAY,
      },
      {
        key: "ArrowRight",
        action: () => dispatch({ type: "MOVE_PIECE", payload: { dx: 1, dy: 0 } }),
        delay: MOVE_DELAY,
      },
      {
        key: "ArrowDown",
        action: () => dispatch({ type: "MOVE_PIECE", payload: { dx: 0, dy: 1 } }),
        delay: SOFT_DROP_DELAY,
      },
    ];

    const handleContinuousInput = () => {
      const now = Date.now();
      movementKeys.forEach(({ key, action, delay }) => {
        if (keysPressed.current.has(key)) {
          const lastTime = lastMoveTime.current[key] || 0;
          if (lastTime === 0 || now - lastTime >= delay) {
            action();
            lastMoveTime.current[key] = now;
          }
        }
      });
    };

    const interval = setInterval(handleContinuousInput, 16);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Game loop - natural piece falling
  useEffect(() => {
    if (game.isGameOver() || game.isPausedState()) return;

    const interval = setInterval(
      () => {
        dispatch({ type: "MOVE_PIECE", payload: { dx: 0, dy: 1 } });
      },
      Math.max(100, 1000 - game.getLines() * 50),
    );

    return () => clearInterval(interval);
  }, [game, game.getLines(), game.isGameOver(), game.isPausedState(), dispatch]);

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

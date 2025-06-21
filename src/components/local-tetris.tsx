"use client";

import { useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces } from "@/components/tetris";
import { useGame, type GameAction } from "@/tetris-game-oop";
import { useAuth } from "@/lib/auth-context";
import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";
import { cn } from "@/lib/utils";

interface LocalTetrisProps {
  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
  seed: number;
}

export default function LocalTetris({ socket, seed }: LocalTetrisProps) {
  const { user } = useAuth();

  // Callback for when lines are cleared (emit to socket for garbage system)
  const onLinesCleared = useCallback(
    (lines: number) => {
      console.log(`LocalTetris: Lines cleared callback called with ${lines} lines`);
      console.log(`LocalTetris: Socket available:`, !!socket);
      socket?.emit("linesCleared", { lines });
    },
    [socket],
  );

  const { game, dispatch } = useGame(seed, onLinesCleared);

  // Refs for keyboard handling
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef<Record<string, number>>({});

  // Combined dispatch function: emit to socket AND apply locally
  const emitAndDispatch = useCallback(
    (action: GameAction) => {
      // Apply locally for immediate feedback
      dispatch(action);
      // Emit to socket for other players
      socket?.emit("gameAction", action);
    },
    [dispatch, socket],
  );

  // Handle incoming garbage from socket
  useEffect(() => {
    if (!socket) return;

    const handleReceiveGarbage = (data: { lines: number; targetUsername: string }) => {
      // Only apply garbage if this client is the target
      if (data.targetUsername === user.username) {
        console.log(`Local player receiving ${data.lines} garbage lines`);
        dispatch({ type: "RECEIVE_GARBAGE", payload: { lines: data.lines } });
      }
    };

    socket.on("receiveGarbage", handleReceiveGarbage);

    return () => {
      socket.off("receiveGarbage", handleReceiveGarbage);
    };
  }, [socket, dispatch, user.username]);

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
          emitAndDispatch({ type: "ROTATE_PIECE", payload: { clockwise: true } });
          break;
        case "z":
        case "Z":
          emitAndDispatch({ type: "ROTATE_PIECE", payload: { clockwise: false } });
          break;
        case " ":
          emitAndDispatch({ type: "HARD_DROP" });
          break;
        case "Shift":
          emitAndDispatch({ type: "HOLD" });
          break;
        case "p":
        case "P":
          emitAndDispatch({ type: "PAUSE" });
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
  }, [emitAndDispatch]);

  // Keyboard controls - continuous movement
  useEffect(() => {
    const MOVE_DELAY = 100;
    const SOFT_DROP_DELAY = 50;

    const movementKeys = [
      {
        key: "ArrowLeft",
        action: () => emitAndDispatch({ type: "MOVE_PIECE", payload: { dx: -1, dy: 0 } }),
        delay: MOVE_DELAY,
      },
      {
        key: "ArrowRight",
        action: () => emitAndDispatch({ type: "MOVE_PIECE", payload: { dx: 1, dy: 0 } }),
        delay: MOVE_DELAY,
      },
      {
        key: "ArrowDown",
        action: () => emitAndDispatch({ type: "MOVE_PIECE", payload: { dx: 0, dy: 1 } }),
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
  }, [emitAndDispatch]);

  // Game loop - emit tick as soft drop action
  useEffect(() => {
    if (game.isGameOver() || game.isPausedState()) return;

    const interval = setInterval(
      () => {
        // Tick is just a soft drop - emit it so other players see the piece falling
        emitAndDispatch({ type: "MOVE_PIECE", payload: { dx: 0, dy: 1 } });
      },
      Math.max(100, 1000 - game.getLines() * 50),
    );

    return () => clearInterval(interval);
  }, [game, game.getLines(), game.isGameOver(), game.isPausedState(), emitAndDispatch]);

  return (
    <div className={cn("flex min-w-fit flex-shrink-0 gap-4 p-4", game.isGameOver() && "bg-red-400")}>
      <Card>
        <CardHeader>
          <CardTitle>{user.username}&apos;s Tetris</CardTitle>
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

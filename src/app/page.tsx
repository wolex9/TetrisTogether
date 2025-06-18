"use client";

import { useEffect, useRef, useCallback } from "react";
import TetrisGame, { type GameAction } from "@/tetris-game-oop";
import useKeyboardControls from "@/hooks/use-keyboard-controls";

export default function Home() {
  const gameDispatchRef = useRef<((action: GameAction) => void) | null>(null);

  const dispatch = useCallback((action: GameAction) => {
    gameDispatchRef.current?.(action);
  }, []);

  const setGameDispatch = useCallback((dispatchFn: (action: GameAction) => void) => {
    gameDispatchRef.current = dispatchFn;
  }, []);

  // Apply keyboard controls
  useKeyboardControls(dispatch);

  return <TetrisGame onDispatchReady={setGameDispatch} />;
}

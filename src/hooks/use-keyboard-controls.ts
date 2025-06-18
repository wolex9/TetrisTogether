import { useEffect, useRef } from "react";
import type { GameAction } from "@/tetris-game-oop";

// Define the game interface that the hook needs
interface GameInstance {
  tick(): void;
  isGameOver(): boolean;
  isPausedState(): boolean;
  getLines(): number;
}

/**
 * Custom hook to handle keyboard controls and game loop for the Tetris game.
 * @param dispatch - function to dispatch GameAction events
 * @param game - optional game instance for automatic ticking (local play only)
 */
export default function useKeyboardControls(dispatch: (action: GameAction) => void, game?: GameInstance) {
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef<Record<string, number>>({});

  // One-time actions: rotate, hold, pause, hard drop
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

  // Continuous movement: left, right, soft drop
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

  // Game loop (only for local play)
  useEffect(() => {
    if (!game || game.isGameOver() || game.isPausedState()) return;

    const interval = setInterval(() => game.tick(), Math.max(100, 1000 - game.getLines() * 50));

    return () => clearInterval(interval);
  }, [game, game?.getLines(), game?.isGameOver(), game?.isPausedState()]);
}

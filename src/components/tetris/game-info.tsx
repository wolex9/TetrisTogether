import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type GameAction =
  | { type: "MOVE_PIECE"; payload: { dx: number; dy: number } }
  | { type: "ROTATE_PIECE"; payload: { clockwise: boolean } }
  | { type: "HARD_DROP" }
  | { type: "HOLD" }
  | { type: "PAUSE" };

interface GameInfoProps {
  score: number;
  lines: number;
  seed: number;
  isPaused: boolean;
  isGameOver: boolean;
  onAction: (action: GameAction) => void;
  onRestart: () => void;
  className?: string;
}

export function GameInfo({ score, lines, seed, isPaused, isGameOver, onAction, onRestart, className }: GameInfoProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div>Score: {score}</div>
          <div>Lines: {lines}</div>
          <div className="text-xs text-gray-500">Seed: {seed}</div>
        </div>

        <div className="space-y-2">
          <Button onClick={() => onAction({ type: "PAUSE" })} className="w-full">
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button onClick={onRestart} className="w-full">
            Restart
          </Button>
        </div>

        {isGameOver && <div className="text-center font-bold text-red-600">Game Over!</div>}

        <div className="space-y-1 text-sm">
          <div>Controls:</div>
          <div>← → Move</div>
          <div>↓ Soft drop</div>
          <div>↑ X: Rotate CW</div>
          <div>Z: Rotate CCW</div>
          <div>Space: Hard drop</div>
          <div>Shift: Hold</div>
          <div>P: Pause</div>
        </div>
      </CardContent>
    </Card>
  );
}

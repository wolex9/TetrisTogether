import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type GameAction =
  | { type: "MOVE_PIECE"; payload: { dx: number; dy: number } }
  | { type: "ROTATE_PIECE"; payload: { clockwise: boolean } }
  | { type: "HARD_DROP" }
  | { type: "HOLD" }
  | { type: "PAUSE" }
  | { type: "RECEIVE_GARBAGE"; payload: { lines: number } };

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
        <CardTitle>Spēles informācija</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div>Punkti: {score}</div>
          <div>Līnijas: {lines}</div>
          <div className="text-xs text-gray-500">Sēkla: {seed}</div>
        </div>

        <div className="space-y-2">
          <Button onClick={() => onAction({ type: "PAUSE" })} className="w-full">
            {isPaused ? "Atsākt" : "Pauzēt"}
          </Button>
          <Button onClick={onRestart} className="w-full">
            Sākt no jauna
          </Button>
        </div>

        {isGameOver && <div className="text-center font-bold text-red-600">Spēle beigusies!</div>}

        <div className="space-y-1 text-sm">
          <div>Vadība:</div>
          <div>← → Kustība</div>
          <div>↓ Mīksta krišana</div>
          <div>↑ X: Grieziet CW</div>
          <div>Z: Grieziet CCW</div>
          <div>Space: Cieta krišana</div>
          <div>Shift: Turēt</div>
          <div>P: Pauze</div>
        </div>
      </CardContent>
    </Card>
  );
}

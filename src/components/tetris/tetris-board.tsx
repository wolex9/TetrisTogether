import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard as GameBoardComponent, HoldPiece, NextPieces } from "@/components/tetris";
import { cn } from "@/lib/utils";
import { TetrisGame } from "@/tetris-game-oop";

interface TetrisBoardProps {
  game: TetrisGame;
  username: string;
}

export function TetrisBoard({ game, username }: TetrisBoardProps) {
  return (
    <div className={cn("flex min-w-fit flex-shrink-0 gap-4 p-4", game.isGameOver() && "bg-red-400")}>
      <Card>
        <CardHeader>
          <CardTitle>{username}&apos;s Tetris</CardTitle>
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiecePreview } from "./piece-preview";
import { type TetrominoType } from "./constants";

interface Tetromino {
  type: TetrominoType;
  getColor(): string;
}

interface HoldPieceProps {
  heldPiece: Tetromino | null;
  canHold: boolean;
  className?: string;
}

export function HoldPiece({ heldPiece, canHold, className }: HoldPieceProps) {
  return (
    <Card className={className}>
      <CardHeader className="px-3">
        <CardTitle className="text-sm">Turēt</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <PiecePreview type={heldPiece?.type} disabled={!canHold} />
      </CardContent>
    </Card>
  );
}

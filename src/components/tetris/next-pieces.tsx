import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiecePreview } from "./piece-preview";
import { type TetrominoType } from "./constants";

interface NextPiecesProps {
  nextPieces: TetrominoType[];
  className?: string;
}

export function NextPieces({ nextPieces, className }: NextPiecesProps) {
  return (
    <Card className={className}>
      <CardHeader className="px-3">
        <CardTitle className="text-sm">Nākamais</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div>
          {nextPieces.map((type, index) => (
            <div key={index} className={index === 0 ? "" : "mt-1"}>
              <PiecePreview type={type} className="mb-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

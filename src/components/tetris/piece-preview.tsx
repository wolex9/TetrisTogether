import { cn } from "@/lib/utils";
import { TETROMINOES, type TetrominoType } from "./constants";

interface PiecePreviewProps {
  type?: TetrominoType;
  className?: string;
  disabled?: boolean;
  size?: "small" | "normal";
}

export function PiecePreview({ type, className, disabled = false, size = "normal" }: PiecePreviewProps) {
  // Create a mini grid for the piece
  const miniGrid = Array(3)
    .fill(null)
    .map(() => Array(4).fill(null));

  // If there's a piece type, add it to the grid
  if (type) {
    const coords = TETROMINOES[type].coords;
    const color = TETROMINOES[type].color;

    // Center the piece in the mini grid
    const offsetX = type === "I" ? 0.5 : 1;
    const offsetY = 1;

    coords.forEach(([dx, dy]) => {
      const x = Math.floor(dx + offsetX);
      const y = Math.floor(dy + offsetY);
      if (x >= 0 && x < 4 && y >= 0 && y < 3) {
        miniGrid[y][x] = color;
      }
    });
  }

  const cellSize = size === "small" ? "h-3 w-4" : "h-4 w-5";

  return (
    <div className={cn("border border-gray-300", disabled && "opacity-50", className)}>
      {miniGrid.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div key={x} className={cn(cellSize, "border border-gray-200", cell || "bg-gray-50")} />
          ))}
        </div>
      ))}
    </div>
  );
}

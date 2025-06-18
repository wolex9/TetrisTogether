import { cn } from "@/lib/utils";
import { BUFFER_ROWS } from "./constants";

interface GameBoardProps {
  board: (string | null)[][];
  className?: string;
}

export function GameBoard({ board, className }: GameBoardProps) {
  return (
    <div className={cn("inline-block border-2 border-gray-400", className)}>
      {board.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              className={cn(
                "h-6 w-6 border border-gray-300",
                y < BUFFER_ROWS && "border-dashed border-gray-200",
                cell === "ghost" ? "bg-gray-500" : cell === "garbage" ? "bg-stone-700" : cell || "bg-gray-100",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

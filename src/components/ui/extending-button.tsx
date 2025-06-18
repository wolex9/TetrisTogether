import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtendingButtonProps {
  text?: string;
  className?: string;
  onClick?: () => void;
}

export function ExtendingButton({ text = "Click me", className, onClick }: ExtendingButtonProps) {
  return (
    <div className="flex w-full justify-end">
      <button
        className={cn(
          "group bg-primary text-primary-foreground flex items-center justify-start py-4 pr-8 pl-6",
          "rounded-l-lg shadow-lg transition-all duration-700 ease-in-out",
          "block w-[35vw] cursor-pointer hover:w-[45vw]",
          className,
        )}
        onClick={onClick}
      >
        <div className="flex w-full items-center transition-transform duration-700 group-hover:translate-x-4">
          <ArrowLeft className="mr-3 h-6 w-6 opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />
          <span className="text-lg font-semibold whitespace-nowrap">{text}</span>
        </div>
      </button>
    </div>
  );
}

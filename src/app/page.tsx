"use client";

import Link from "next/link";
import { ExtendingButton } from "@/components/ui/extending-button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Title Section - Centered at Top */}
      <div className="absolute top-1/4 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform text-center">
        <h1 className="mb-4 text-8xl font-bold text-gray-800">TETRIS</h1>
        <p className="text-2xl text-gray-600">Izvēlieties spēles režīmu</p>
      </div>

      {/* Extending Buttons - Right Side, Below Title */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 transform space-y-4">
        <div>
          <Link href="/singleplayer">
            <ExtendingButton text="Viens spēlētājs" />
          </Link>
        </div>
        <div>
          <Link href="/multiplayer">
            <ExtendingButton text="Vairāki spēlētāji" />
          </Link>
        </div>
        <div>
          <Link href="/leaderboard">
            <ExtendingButton text="Līderu tabulas" />
          </Link>
        </div>
      </div>
    </div>
  );
}

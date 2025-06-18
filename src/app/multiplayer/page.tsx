"use client";

import Lobby from "@/components/lobby";
import Link from "next/link";

export default function MultiplayerPage() {
  const roomId = "default-room";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Vairāki spēlētāji</h1>
          <Link href="/" className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            ← Atpakaļ
          </Link>
        </div>

        <Lobby roomId={roomId} />
      </div>
    </div>
  );
}

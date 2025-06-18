"use client";

import { useParams } from "next/navigation";
import Lobby from "@/components/lobby";
import Link from "next/link";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-red-600">Nederīgs istabas ID</h1>
          <Link
            href="/multiplayer"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ← Atpakaļ uz daudzspēlētāju režīmu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Istaba: {roomId}</h1>
          <Link
            href="/multiplayer"
            className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            ← Pamest istabu
          </Link>
        </div>

        <Lobby roomId={roomId} />
      </div>
    </div>
  );
}

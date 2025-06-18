"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function MultiplayerPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    setIsCreating(true);
    const newRoomId = generateRoomId();
    router.push(`/multiplayer/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/multiplayer/${roomId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Vairāki spēlētāji</h1>
          <Link href="/" className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            ← Atpakaļ
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="space-y-6">
            {/* Create Room */}
            <div className="text-center">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Izveidot jaunu istabu</h2>
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                size="lg"
                className="w-full max-w-sm bg-green-600 px-8 py-4 text-lg font-bold text-white hover:bg-green-700"
              >
                {isCreating ? "Izveido..." : "🎮 Izveidot istabu"}
              </Button>
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="mx-4 text-sm text-gray-500">vai</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Join Room */}
            <div>
              <h2 className="mb-4 text-center text-xl font-semibold text-gray-800">Pievienoties istabai</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="roomId" className="mb-2 block text-sm font-medium text-gray-700">
                    Istabas ID
                  </label>
                  <Input
                    id="roomId"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Ievadiet istabas ID (piemēram: ABC123)"
                    className="text-center font-mono text-lg tracking-widest uppercase"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim()}
                  size="lg"
                  className="w-full bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700"
                >
                  🚪 Pievienoties istabai
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

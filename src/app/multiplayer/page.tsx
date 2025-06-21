"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { io } from "socket.io-client";
import type { RoomInfo } from "@/types/socket";

export default function MultiplayerPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect to main namespace for room listing
    const socketConnection = io();

    // Listen for rooms updates
    socketConnection.on("roomsList", (roomsList: RoomInfo[]) => {
      setRooms(roomsList);
      setIsLoading(false);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    setIsCreating(true);
    const newRoomId = generateRoomId();
    router.push(`/multiplayer/${newRoomId}`);
  };

  const handleJoinRoom = (targetRoomId?: string) => {
    const targetId = targetRoomId || roomId.trim();
    if (targetId) {
      router.push(`/multiplayer/${targetId.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Vairāki spēlētāji</h1>
          <Link href="/" className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            ← Atpakaļ
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left side - Create/Join Room */}
          <Card>
            <CardContent className="space-y-6">
              {/* Create Room */}
              <div className="text-center">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Izveidot jaunu istabu</h2>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  size="lg"
                  className="w-full bg-green-600 px-8 py-4 text-lg font-bold text-white hover:bg-green-700"
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
                <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">Pievienoties istabai</h2>
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
                      placeholder="ABC123"
                      className="text-center text-lg tracking-widest uppercase"
                      maxLength={6}
                      onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                    />
                  </div>
                  <Button
                    onClick={() => handleJoinRoom()}
                    disabled={!roomId.trim()}
                    size="lg"
                    className="w-full bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700"
                  >
                    🚪 Pievienoties istabai
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right side - Active Rooms */}
          <Card>
            <CardHeader>
              <CardTitle>Aktīvās istabas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-500">Ielādē...</div>
              ) : rooms.length === 0 ? (
                <div className="text-center text-gray-500">Nav aktīvu istabu</div>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {rooms
                    .sort((a, b) => {
                      if (a.isGameStarted === b.isGameStarted) return 0;
                      return a.isGameStarted ? 1 : -1;
                    })
                    .map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between rounded-lg border p-2 px-3 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-semibold">{room.id}</h3>
                          <div className="my-1 flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              {room.hostUsername}
                            </Badge>
                            <Badge className="bg-blue-500 text-white">{room.memberCount}</Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={room.isGameStarted}
                          variant={room.isGameStarted ? "outline" : "default"}
                        >
                          {room.isGameStarted ? "Spēle notiek" : "Pievienoties"}
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

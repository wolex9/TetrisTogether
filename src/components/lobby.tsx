"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import LocalTetris from "./local-tetris";
import RemoteTetris from "./remote-tetris";
import type { ServerToClientEvents, ClientToServerEvents, RoomMember } from "@/types/socket";
import { cn } from "@/lib/utils";

interface LobbyProps {
  roomId: string;
}

export default function Lobby({ roomId }: LobbyProps) {
  const { user } = useAuth();
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameSeed, setGameSeed] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Set up socket connection
  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`/${roomId}`);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Broadcast username on join
      socket.emit("join", { username: user.username });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Handle room member updates (types are now inferred)
    socket.on("roomMembers", (members) => {
      setRoomMembers(members);
      // Check if current user is host
      const currentUser = members.find((member) => member.socketId === socket.id);
      setIsHost(currentUser?.isHost || false);
    });

    // Handle game start
    socket.on("gameStarted", (data) => {
      console.log("Received gameStarted event:", data);
      setIsGameStarted(true);
      setGameSeed(data.seed);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, user.username]);

  // Handle start game button click
  const handleStartGame = () => {
    console.log("Sending startGame event");
    socketRef.current?.emit("startGame");
  };

  // Render components based on room members
  const renderGameComponents = () => {
    if (!socketRef.current || !isConnected || !isGameStarted || !gameSeed) return null;

    const currentUserSocketId = socketRef.current.id;
    const otherMembers = roomMembers.filter((member) => member.socketId !== currentUserSocketId);

    return (
      <div className="flex justify-evenly gap-4 overflow-x-auto pb-4">
        {/* Local player */}
        <LocalTetris socket={socketRef.current} seed={gameSeed} />

        {/* Remote players */}
        {otherMembers.map((member) => (
          <RemoteTetris
            key={member.socketId}
            socket={socketRef.current!}
            targetUsername={member.username}
            seed={gameSeed}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`mx-auto flex w-full flex-col items-center space-y-8 p-4 ${isGameStarted ? "max-w-none" : "max-w-md"}`}
    >
      {!isConnected && (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Savienojas ar istabu {roomId}...</div>
        </div>
      )}

      {isConnected && !isGameStarted && (
        <>
          {/* Game Mode Info */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Badge className="bg-blue-500 text-white">Vairākspēlētāju</Badge>
                <Badge variant="outline" className="border-green-500 text-green-600">
                  {roomMembers.length} spēlētāji tiešsaistē
                </Badge>
              </div>
              <CardTitle className="text-2xl">Spēles Vestibils</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {/* Players List */}
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <div className="mb-2 text-sm font-medium text-gray-700">Spēlētāju saraksts:</div>
                <div className="text-sm text-gray-600">
                  {roomMembers.map((m, index) => (
                    <div key={m.socketId} className="flex items-center justify-between py-1">
                      <span className={cn(m.username == user.username && "font-bold text-green-600")}>
                        {m.username}
                      </span>
                      <span className="text-xs">
                        {m.isHost && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600">
                            Saimnieks
                          </Badge>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {isHost && (
                <div className="mt-3 rounded bg-blue-50 p-2 text-xs font-medium text-blue-600">
                  🎮 Jūs esat istabas saimnieks
                </div>
              )}
            </CardContent>
          </Card>

          {/* Big START Button */}
          <Button
            size="lg"
            className="h-16 w-full bg-green-600 text-xl font-bold transition-all duration-200 hover:scale-105 hover:bg-green-700 disabled:bg-gray-400 disabled:hover:scale-100"
            onClick={handleStartGame}
            disabled={!isHost}
          >
            <Play className="mr-2 h-6 w-6" />
            {isHost ? "SĀKT SPĒLI" : "GAIDA SAIMNIEKU"}
          </Button>

          {/* Back Button */}
          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            Atpakaļ uz spēļu izvēli
          </Button>
        </>
      )}

      {isGameStarted && renderGameComponents()}
    </div>
  );
}

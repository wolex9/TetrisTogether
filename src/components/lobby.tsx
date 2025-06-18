"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import LocalTetris from "./local-tetris";
import RemoteTetris from "./remote-tetris";
import type { ServerToClientEvents, ClientToServerEvents, RoomMember } from "@/types/socket";

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
      <div className="flex flex-wrap gap-4">
        {/* Local player */}
        <LocalTetris socket={socketRef.current} seed={gameSeed} roomMembers={roomMembers} />

        {/* Remote players */}
        {otherMembers.map((member) => (
          <RemoteTetris
            key={member.socketId}
            socket={socketRef.current!}
            targetUsername={member.username}
            seed={gameSeed}
            roomMembers={roomMembers}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="lobby">
      {!isConnected && (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Savienojas ar istabu {roomId}...</div>
        </div>
      )}

      {isConnected && (
        <>
          <div className="mb-4 rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-2 font-semibold">Istaba: {roomId}</h3>
            <div className="text-sm text-gray-600">
              Spēlētāji ({roomMembers.length}):{" "}
              {roomMembers.map((m) => `${m.username}${m.isHost ? " (Saimnieks)" : ""}`).join(", ")}
            </div>
            {isHost && (
              <div className="mt-2 text-xs font-medium text-blue-600">
                🎮 Jūs esat istabas saimnieks - tikai jūs varat sākt spēli
              </div>
            )}
          </div>

          {!isGameStarted && (
            <div className="mb-8 flex justify-center">
              <Button onClick={handleStartGame} size="lg" className="px-12 py-6 text-xl font-bold" disabled={!isHost}>
                {isHost ? "🚀 Sākt spēli" : "⏳ Gaida saimnieku..."}
              </Button>
            </div>
          )}

          {isGameStarted && renderGameComponents()}
        </>
      )}
    </div>
  );
}

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
    });

    socket.on("userJoined", (member) => {
      setRoomMembers((prev) => [...prev, member]);
    });

    socket.on("userLeft", (member) => {
      setRoomMembers((prev) => prev.filter((m) => m.socketId !== member.socketId));
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
    <div className="lobby">
      {!isConnected && (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Connecting to room {roomId}...</div>
        </div>
      )}

      {isConnected && (
        <>
          <div className="mb-4 rounded-lg bg-gray-100 p-4">
            <h3 className="mb-2 font-semibold">Room: {roomId}</h3>
            <div className="text-sm text-gray-600">
              Players ({roomMembers.length}): {roomMembers.map((m) => m.username).join(", ")}
            </div>
          </div>

          {!isGameStarted && (
            <div className="mb-8 flex justify-center">
              <Button onClick={handleStartGame} size="lg" className="px-12 py-6 text-xl font-bold">
                🚀 Start Game
              </Button>
            </div>
          )}

          {isGameStarted && renderGameComponents()}
        </>
      )}
    </div>
  );
}

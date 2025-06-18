"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
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
  const [seed] = useState(() => Math.floor(Math.random() * 1000000)); // Generate lobby seed once

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

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, user.username]);

  // Render components based on room members
  const renderGameComponents = () => {
    if (!socketRef.current || !isConnected) return null;

    const currentUserSocketId = socketRef.current.id;
    const otherMembers = roomMembers.filter((member) => member.socketId !== currentUserSocketId);

    return (
      <div className="flex flex-wrap gap-4">
        {/* Local player */}
        <LocalTetris socket={socketRef.current} seed={seed} />

        {/* Remote players */}
        {otherMembers.map((member) => (
          <RemoteTetris
            key={member.socketId}
            socket={socketRef.current!}
            targetUsername={member.username}
            seed={seed}
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
          {renderGameComponents()}
        </>
      )}
    </div>
  );
}

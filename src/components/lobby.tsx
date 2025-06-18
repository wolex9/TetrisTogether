"use client";

import { useEffect, useRef, useState, ReactNode, cloneElement, isValidElement } from "react";
import { io, Socket } from "socket.io-client";

interface LobbyProps {
  roomId: string;
  children: ReactNode;
}

export default function Lobby({ roomId, children }: LobbyProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Set up socket connection
  useEffect(() => {
    const socket = io(`/${roomId}`);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  // Helper function to pass socket to children
  const renderChildrenWithSocket = (children: ReactNode): ReactNode => {
    if (!socketRef.current || !isConnected) {
      return children;
    }

    if (isValidElement(children)) {
      // Clone the child element and pass the socket as a prop
      return cloneElement(children, { socket: socketRef.current } as any);
    }

    // Handle multiple children
    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            key: index,
            socket: socketRef.current,
          } as any);
        }
        return child;
      });
    }

    return children;
  };

  return (
    <div className="lobby">
      {!isConnected && (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Connecting to room {roomId}...</div>
        </div>
      )}

      {isConnected && renderChildrenWithSocket(children)}
    </div>
  );
}

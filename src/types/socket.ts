import { type GameAction } from "@/tetris-game-oop";

export interface ServerToClientEvents {
  // Room management
  roomMembers: (members: RoomMember[]) => void;
  userJoined: (member: RoomMember) => void;
  userLeft: (member: RoomMember) => void;

  // Game events
  gameAction: (action: GameAction) => void;
}

export interface ClientToServerEvents {
  // Room management
  join: (data: { username: string }) => void;

  // Game events
  gameAction: (action: GameAction) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  username: string;
  roomId: string;
}

export interface RoomMember {
  username: string;
  socketId: string;
}

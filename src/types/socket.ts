import { type GameAction } from "@/tetris-game-oop";

export interface ServerToClientEvents {
  // Room management
  roomMembers: (members: RoomMember[]) => void;
  userJoined: (member: RoomMember) => void;
  userLeft: (member: RoomMember) => void;

  // Game events - includes username to identify which player's action
  gameAction: (data: { username: string; action: GameAction }) => void;

  // Game start/control
  gameStarted: (data: { seed: number }) => void;
}

export interface ClientToServerEvents {
  // Room management
  join: (data: { username: string }) => void;

  // Game events - server will add username from socket data
  gameAction: (action: GameAction) => void;

  // Game start/control
  startGame: () => void;
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

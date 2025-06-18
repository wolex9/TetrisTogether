import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  RoomMember,
  Room,
} from "./src/types/socket.js";

const port = parseInt(process.env.PORT || "3000");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store persistent rooms: roomId -> Room
  const rooms = new Map<string, Room>();

  // Handle different room namespaces
  io.of(/^\/.*$/).on("connection", (socket) => {
    const namespace = socket.nsp.name;
    const roomId = namespace.slice(1); // Remove the leading '/'

    console.log(`User connected to room: ${roomId}, socket id: ${socket.id}`);

    // Handle user join with username
    socket.on("join", (data) => {
      const { username } = data;

      // Store user data in socket
      socket.data.username = username;
      socket.data.roomId = roomId;

      // Initialize room if it doesn't exist or add user to existing room
      let room = rooms.get(roomId);
      const isFirstUser = !room;

      if (!room) {
        room = {
          id: roomId,
          hostSocketId: socket.id,
          members: [],
          isGameStarted: false,
        };
        rooms.set(roomId, room);
      }

      // Add user to room members
      const member: RoomMember = {
        username,
        socketId: socket.id,
        isHost: socket.id === room.hostSocketId,
      };
      room.members.push(member);

      // Join the socket room
      socket.join(roomId);

      console.log(`${username} joined room: ${roomId} ${isFirstUser ? "(as host)" : ""}`);

      // Send current room members to all users in the room
      socket.nsp.emit("roomMembers", room.members);
    });

    // Handle game actions
    socket.on("gameAction", (action) => {
      // Get username from socket data and broadcast with username attached
      const username = socket.data.username;
      if (username) {
        socket.to(roomId).emit("gameAction", { username, action });
      }
    });

    // Handle start game request (only host can start)
    socket.on("startGame", () => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Check if the requesting user is the host
      if (socket.id !== room.hostSocketId) {
        console.log(`Non-host ${socket.data.username} tried to start game in room ${roomId}`);
        return;
      }

      // Check if game is already started
      if (room.isGameStarted) {
        console.log(`Game already started in room ${roomId}`);
        return;
      }

      // Generate a random seed for synchronized gameplay
      const seed = Math.floor(Math.random() * 1000000);
      room.isGameStarted = true;
      room.gameSeed = seed;

      console.log(`Host ${socket.data.username} starting game in room ${roomId} with seed: ${seed}`);

      // Broadcast game start to all players in the namespace (including sender)
      socket.nsp.emit("gameStarted", { seed });
    });

    // Handle lines cleared (garbage system)
    socket.on("linesCleared", (data) => {
      const username = socket.data.username;
      const room = rooms.get(roomId);

      if (username && room && data.lines > 1) {
        // Only send garbage for 2+ lines
        const garbageLines = data.lines - 1; // Send 1 less than cleared lines

        // Get other players in the room (exclude the sender)
        const otherPlayers = room.members.filter((member) => member.socketId !== socket.id);

        if (otherPlayers.length > 0) {
          // Pick a random target from other players
          const randomTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

          console.log(
            `${username} cleared ${data.lines} lines, sending ${garbageLines} garbage to ${randomTarget.username}`,
          );

          // Broadcast garbage to all players with target info for client-side filtering
          socket.nsp.emit("receiveGarbage", {
            lines: garbageLines,
            fromUsername: username,
            targetUsername: randomTarget.username,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Find and remove user from room members
      const userIndex = room.members.findIndex((member) => member.socketId === socket.id);
      if (userIndex === -1) return;

      const user = room.members[userIndex];
      room.members.splice(userIndex, 1);

      console.log(`${user.username} disconnected from room: ${roomId}`);

      // If this was the host and there are other members, assign new host
      if (user.isHost && room.members.length > 0) {
        const newHost = room.members[0];
        newHost.isHost = true;
        room.hostSocketId = newHost.socketId;
        console.log(`${newHost.username} is now the host of room ${roomId}`);
      }

      // Notify other users and send updated member list
      if (room.members.length > 0) {
        socket.to(roomId).emit("roomMembers", room.members);
      }

      // Clean up empty rooms
      if (room.members.length === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    });

    // Add more game-specific events here later
  });

  httpServer.listen(port, () => {
    console.log(`Starting...\nhttp://localhost:${port}\n`);
  });
});

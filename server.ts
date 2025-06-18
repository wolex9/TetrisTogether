import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  RoomMember,
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

  // Store room members: roomId -> { socketId -> RoomMember }
  const roomMembers = new Map<string, Map<string, RoomMember>>();

  // Handle different room namespaces
  io.of(/^\/.*$/).on("connection", (socket) => {
    const namespace = socket.nsp.name;
    const roomId = namespace.slice(1); // Remove the leading '/'

    console.log(`User connected to room: ${roomId}, socket id: ${socket.id}`);

    // Initialize room if it doesn't exist
    if (!roomMembers.has(roomId)) {
      roomMembers.set(roomId, new Map());
    } // Handle user join with username
    socket.on("join", (data) => {
      const { username } = data;

      // Store user data in socket
      socket.data.username = username;
      socket.data.roomId = roomId;

      // Add user to room members
      const room = roomMembers.get(roomId)!;
      const member: RoomMember = { username, socketId: socket.id };
      room.set(socket.id, member);

      // Join the socket room
      socket.join(roomId);

      console.log(`${username} joined room: ${roomId}`);

      // Send current room members to the joining user
      const members = Array.from(room.values());
      socket.emit("roomMembers", members);

      // Notify other users in the room about the new member
      socket.to(roomId).emit("userJoined", member);
    });

    // Handle game actions
    socket.on("gameAction", (action) => {
      // Broadcast the action to other users in the room
      socket.to(roomId).emit("gameAction", action);
    });
    socket.on("disconnect", () => {
      // Remove user from room members
      const room = roomMembers.get(roomId);
      if (room) {
        const user = room.get(socket.id);
        if (user) {
          room.delete(socket.id);
          console.log(`${user.username} disconnected from room: ${roomId}`);

          // Notify other users about the disconnection
          socket.to(roomId).emit("userLeft", user);
        }

        // Clean up empty rooms
        if (room.size === 0) {
          roomMembers.delete(roomId);
        }
      }
    });

    // Add more game-specific events here later
  });

  httpServer.listen(port, () => {
    console.log(`Starting...\nhttp://localhost:${port}\n`);
  });
});

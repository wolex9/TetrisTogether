import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store room members: roomId -> { socketId -> { username, socketId } }
  const roomMembers = new Map<string, Map<string, { username: string; socketId: string }>>();

  // Handle different room namespaces
  io.of(/^\/.*$/).on("connection", (socket) => {
    const namespace = socket.nsp.name;
    const roomId = namespace.slice(1); // Remove the leading '/'

    console.log(`User connected to room: ${roomId}, socket id: ${socket.id}`);

    // Initialize room if it doesn't exist
    if (!roomMembers.has(roomId)) {
      roomMembers.set(roomId, new Map());
    }

    // Handle user join with username
    socket.on("join", (data: { username: string }) => {
      const { username } = data;

      // Add user to room members
      const room = roomMembers.get(roomId)!;
      room.set(socket.id, { username, socketId: socket.id });

      // Join the socket room
      socket.join(roomId);

      console.log(`${username} joined room: ${roomId}`);

      // Send current room members to the joining user
      const members = Array.from(room.values());
      socket.emit("roomMembers", members);

      // Notify other users in the room about the new member
      socket.to(roomId).emit("userJoined", { username, socketId: socket.id });
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
          socket.to(roomId).emit("userLeft", { username: user.username, socketId: socket.id });
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

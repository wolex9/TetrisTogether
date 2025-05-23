import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = App();
const io = new Server({
  serveClient: false,
  cors: {
    origin: "*", // In production, restrict this to your domain
    methods: ["GET", "POST"],
  },
});

io.attachApp(app);

// Track rooms and their users (roomId -> Map of users)
const rooms = new Map();

// Handle connections to rooms with 4-character IDs including lobby/{roomId}
io.of(/^\/[^\W_]{4}$/).on("connection", (socket) => {
  const namespace = socket.nsp;
  const roomId = namespace.name.split("/").pop(); // Get the room ID from the namespace

  console.log(`User connected to ${namespace.name} (room: ${roomId})`);

  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  // Handle user joining with their info
  socket.on("join", (userData) => {
    // Store user data with socket ID as key
    const roomUsers = rooms.get(roomId);
    const userInfo = {
      id: socket.id,
      username: userData.username,
      isAnonymous: userData.isAnonymous || false,
      avatar: userData.avatar || null,
      joinedAt: new Date(),
    };

    roomUsers.set(socket.id, userInfo);

    // Broadcast to the room that a new user has joined
    namespace.emit("userJoined", userInfo);

    // Send the current user list to the client that just joined
    socket.emit("users", Array.from(roomUsers.values()));

    console.log(`User ${userData.username} joined room ${roomId}`);
  });

  // When user disconnects
  socket.on("disconnect", () => {
    if (rooms.has(roomId)) {
      const roomUsers = rooms.get(roomId);
      const user = roomUsers.get(socket.id);

      if (user) {
        // Remove user from tracked users
        roomUsers.delete(socket.id);
        console.log(`User ${user.username} disconnected from room ${roomId}`);

        // Broadcast to the room that a user has left
        namespace.emit("userLeft", { id: socket.id });

        // If room is empty, clean it up
        if (roomUsers.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} is now empty and has been removed`);
        }
      }
    }
  });

  // Handle chat messages
  socket.on("message", (message) => {
    if (rooms.has(roomId)) {
      const user = rooms.get(roomId).get(socket.id);
      if (user) {
        // Add user info and timestamp to the message
        const messageWithInfo = {
          id: Math.random().toString(36).substring(2, 15),
          userId: socket.id,
          username: user.username,
          isAnonymous: user.isAnonymous,
          text: message.text,
          timestamp: new Date(),
        };

        // Broadcast the message to everyone in the room
        namespace.emit("message", messageWithInfo);
      }
    }
  });
});

const PORT = 4987;
app.listen(PORT, (listen_sock) => {
  console.log(listen_sock ? `Listening on port ${PORT}!` : "Error!");
});

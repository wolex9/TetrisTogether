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

  // Handle different room namespaces
  io.of(/^\/.*$/).on("connection", (socket) => {
    const namespace = socket.nsp.name;
    const roomId = namespace.slice(1); // Remove the leading '/'

    console.log(`User connected to room: ${roomId}, socket id: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected from room: ${roomId}, socket id: ${socket.id}`);
    });

    // Add more game-specific events here later
  });

  httpServer.listen(port, () => {
    console.log(`Starting...\nhttp://localhost:${port}\n`);
  });
});

import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(socket);
  });

  httpServer.listen(port, () => {
    console.log(`Starting...\nhttp://localhost:${port}\n`);
  });
});

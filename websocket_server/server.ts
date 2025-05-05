import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = App();
const io = new Server({
  serveClient: false,
});

io.attachApp(app);

io.of(/^\/[^\W_]{4}$/).on("connection", (socket) => {
  const room = socket.nsp;
});

const PORT = 4987;
app.listen(PORT, (listen_sock) => {
  console.log(listen_sock ? `Listening on port ${PORT}!` : "Error!");
});

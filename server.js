import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = next({ dev, hostname, port, turbo: dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`> Starting ${dev ? "development" : "production"} server...`);

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      // socket.to(socket.data.sessionId).emit("notification", {
      //   message: `${socket.data.user.name} has disconnected.`,
      //   type: "info",
      // });
      socket.leave(socket.data.sessionId);
      socket.data = {};
    });

    socket.on("join", ({ user, sessionId }) => {
        socket.leave(socket.data.sessionId);

        socket.data.user = user;
        socket.data.sessionId = sessionId;

        socket.join(sessionId);
        socket.to(sessionId).emit("notification", {
          message: `${socket.data.user.name} joined!`,
          type: "info",
        });
        socket.to(sessionId).emit("joined", {
          roomSize: io.sockets.adapter.rooms.get(sessionId)?.size || 0,
        });
    });

    socket.on("match", ({ sessionId, business }) => {
      socket.to(sessionId).emit("matched", business);
    });
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

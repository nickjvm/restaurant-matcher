import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on(
      "join",
      ({ user, sessionId }: { user: { name: string }; sessionId: string }) => {
        socket.join(sessionId);
        console.log("Message received:", sessionId);

        socket.to(sessionId).emit("joined", { user });
      }
    );

    socket.on("match", ({ sessionId, business }) => {
      console.log("Match found:", business);
      socket.to(sessionId).emit("matched", business);
    });

    socket.on("vote", ({ sessionId, businessId, vote, userId }) => {
      console.log(
        `User ${userId} voted ${vote} for business ${businessId} in session ${sessionId}`
      );
      if (vote === "like") {
        socket.to(sessionId).emit("voted", { vote, businessId, userId });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });

  server.listen(port);

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});

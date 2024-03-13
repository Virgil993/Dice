const io = require("socket.io")(3000, {
  cors: { origin: "http://localhost:8080" },
});

const users = {};

io.on("connection", (socket) => {
  socket.on("set-userId", (userId) => {
    console.log("we set the userid");
    users[userId] = socket.id; // Store the socket ID associated with the username
  });
  socket.on("send-chat-message", async (message) => {
    const recevier = message.recevier;
    const recevierSocketId = users[recevier];
    if (recevierSocketId) {
      io.to(recevierSocketId).emit("chat-message", message);
    } else {
      console.log("we can't find the userId");
    }
  });

  socket.on("send-notification", async (notification) => {
    const recevier = notification.recevier;
    const recevierSocketId = users[recevier];
    if (recevierSocketId) {
      io.to(recevierSocketId).emit("notification", notification);
    } else {
      console.log("we can't find the userId");
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

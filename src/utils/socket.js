const socket = require("socket.io");

initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //Handle events

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      // when multiple user chats to each other , it creates a seperate room for indivisual people
      const roomId = [userId, targetUserId].sort().join("_"); // this is create a unique room id (userId-targetUserId) , sort() because it looks like same
      console.log(firstName + " Joining Room : " + roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      console.log(firstName + " " + text);
      io.to(roomId).emit("messageReceived", { firstName,text });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

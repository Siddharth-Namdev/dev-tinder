const socket = require("socket.io");
const { Chat } = require("../models/chat");

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

    socket.on(
      "sendMessage",
      async ({ firstName,lastName, userId, targetUserId, text }) => {
        //Save message to the database
        try {
          const roomId = [userId, targetUserId].sort().join("_");
          console.log(firstName + " " + text);
          // when i send message , it chan be the first message or it can be the existing chat where i append the message

          //find chat is exist or not --> if exist then push the message , if not exist create a chat

          //find chat in database where the participants are userId and targetUserId
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            // it means these two people chat first time

            chat = new Chat({
              // create a new chat
              participants: [userId, targetUserId],
              message: [],
            });
          }

          chat.message.push({
            //push chat in DB
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName,text });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

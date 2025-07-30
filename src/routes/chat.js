const express = require("express");
const { Chat } = require("../models/chat");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "message.senderId",
      select: "firstName  lastName",
    });

    if (!chat) {
      // it means these two people chat first time

      chat = new Chat({
        // create a new chat
        participants: [userId, targetUserId],
        message: [],
      });
      await chat.save();
      
    }
    res.json(chat)
  } catch (err) {
    console.log(err);
  }
});

module.exports = chatRouter;

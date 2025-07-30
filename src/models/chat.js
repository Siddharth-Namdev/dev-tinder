// this is for save the message in the chat
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(   // every message shpuld have its own senderID,text and timestamps
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// participants two honge (sender or receiver) , isiliye array liya h  ,
// but this array can have more than 2 people , for future if create a group chat
const chatSchema = mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  message:[messageSchema],  // message v bhut sare ho skte h isiliye array use kiya h 
});


const Chat = mongoose.model("Chat",chatSchema);
module.exports = {Chat};

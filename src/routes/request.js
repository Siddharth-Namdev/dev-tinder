const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      // if status is other than interested or rejected then throw error
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid Status type : " + status });
      }

      // when we send connection request which is not present in DB , it theow error
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not Found" });
      }

      //IF there is an existing ConnectionRequest -> agar mene ksis ko connection request
      //     bhej rakhi h to wo kisi ko connection request na bhej paye , or me dobara
      //     same person ko connectionRequest na bhej pau
      const existingConnectingRequest = await ConnectionRequest.findOne({
        $or: [
          //this is mongoBD OR condition
          { fromUserId, toUserId }, //if FromUserId and toUserId is already exist in DB
          { fromUserId: toUserId, toUserId: fromUserId }, // OR reverse
        ],
      });

      if (existingConnectingRequest) {
        return res
          .status(400)
          .send({ message: "Connetion Request Already Exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        //ye sirf accept ya reject kr skti h
        return res.status(400).json({ message: "Status not allowed ! " });
      }

      //for Validate API , jo v interest request h , sirf whi accept ya reject hogi
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request not found" });
      }
      //jo v updated status hoga (accecpt ya reject) , wo save ho jyega
      connectionRequest.status = status;
      // DB me data save kern k liye
      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send({ message: "ERROR : " + err.message });
    }
  }
);

module.exports = requestRouter;

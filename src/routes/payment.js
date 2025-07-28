const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { userAuth } = require("../middlewares/auth.js");
const Payment = require("../models/payment.js");
const { membershipAmount } = require("../utils/constants.js");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user.js");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, // it convert in paisa, thats why *100
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    // save it in my database
    console.log(order);

    const payment = new Payment({
      // jo v data order se return hua h , uske hisab se payment create krega
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save(); // store all indormation in database

    // Return back my order detail to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID }); //all data return to frontend
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {

    const webhookSignature = req.get("X-Razorpay-Signature")

    const isWebhookValid = validateWebhookSignature(   //predefined function of razorpay
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if(!isWebhookValid){
      return res.status(400).json({msg:"Webhook signature is invalid"});
    }

    // Update my payment status in DB
    const paymentDetails = req.body.payload.payment.entity;  // this data razorpay gives when any payment done or fail
    const payment = await Payment.findOne({orderId:paymentDetails.order_id});   // Db me payment ID find kri
    payment.status = paymentDetails.status;  // jo v payment ka status hoga , use DB me store kar denge
    await payment.save();

    const user = await User.findOne({_id:payment.userId});
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();



  } catch (err) {}
});

module.exports = paymentRouter;

const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    userId: {   //jo payment karna chahta h 
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
        type:String,
        required:true,
    },
    receipt:{
        type:String,
        required:true,
    },
    notes: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      membershipType: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("payment",paymentSchema);
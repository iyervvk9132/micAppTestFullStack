const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
  orders: [
    {
      itemId: Number,
      items: String,
      service: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  payment: {
    totalPaid: { type: Number, default: 0 },
    totalUnpaid: { type: Number, default: 0 },
    razorpayOrderId: String, // New subfield for Razorpay order ID
  },
  pickupDate: Date,
  deliveryDate: Date,
  pickupTime: String,
  deliveryTime: String,
  isPickedUp: { type: Boolean, default: false },
  isPickedUpReached: { type: Boolean, default: false },
  pickupDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  isDriverConfirmed: { type: Boolean, default: false },
  isWorkStarted: { type: Boolean, default: false },
  isWorkCompleted: { type: Boolean, default: false },
  isDeliveryPickuped: { type: Boolean, default: false },
  deliveryDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  isDelivered: { type: Boolean, default: false },
  deliveryCompletedAt:Date,
});

/**
 * @model Order
 * @description Mongoose model for the Order schema.
 */
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

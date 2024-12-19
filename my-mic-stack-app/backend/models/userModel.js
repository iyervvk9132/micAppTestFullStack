const mongoose = require("mongoose");

// Define the User Schema
const userSchema = new mongoose.Schema({
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  order: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
  ],
  totalUnpaid: Number,
  totalPaid: Number,
  razorpayId: { type: mongoose.Schema.Types.ObjectId }, // Fixed type
  razorpayCustomerId: { type: String }, 
  address: {
    latitude: Number,
    longitude: Number,
    streetName: String,
    areaName: String,
    cityName: String,
    stateName: String,
    countryName: String,
    zipCode: String,
    userApartmentName: String,
    userStreetName: String,
    userLandmark: String,
    isFilled: { type: Boolean, default: false },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Create the User Model
const User = mongoose.model("customers", userSchema);

module.exports = User;

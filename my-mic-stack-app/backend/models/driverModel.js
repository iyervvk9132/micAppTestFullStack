const mongoose = require("mongoose");



/**
 * @schema Driver
 * @description Mongoose schema for the Driver model.
 * @property {string} phone - Driver's phone number.
 * @property {boolean} isVerified - Driver verification status, default is false.
 * @property {string} verificationCode - Verification code sent to the driver.
 * @property {Array} pickupOrder - Array of pickup orders associated with the driver.
 * @property {Array} deliveryOrder - Array of delivery orders associated with the driver.
 * @property {Object} address - Driver's address information.
 * @property {number} address.latitude - Latitude of the address.
 * @property {number} address.longitude - Longitude of the address.
 * @property {string} address.road - Road of the address.
 * @property {string} address.suburb - Suburb of the address.
 * @property {string} address.city - City of the address.
 * @property {string} address.state - State of the address.
 * @property {string} address.country - Country of the address.
 * @property {string} address.countryCode - Country code of the address.
 * @property {Array} salary - Array containing daily cost, monthly wages, and loan details.
 */
const driverSchema = new mongoose.Schema({
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  pickupOrder: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      date: Date,
    },
  ],
  deliveryOrder: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      date: Date,
    },
  ],
  address: {
    latitude: Number,
    longitude: Number,
    road: String,
    suburb: String,
    city: String,
    state: String,
    country: String,
    countryCode: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  salary: [
    {
      dailyCost: [{ date: Date, money: Number }],
      monthlyWages: [{ date: Date, money: Number }],
      loan: [{ date: Date, money: Number }],
    },
  ],
});

/**
 * @model Driver
 * @description Mongoose model for the Driver schema.
 */
const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;

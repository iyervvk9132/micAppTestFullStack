const mongoose = require('mongoose');

// Define the order schema
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Reference to the Customer model
    required: true
  },
  products: [
    {
      productName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothes', // Reference to the clothes model
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  pickupDateTime: {
    type: Date,
    default: Date.now
  },
  deliveryDateTime: {
    type: Time,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'In Use', 'Under Maintenance', 'Out of Service'] // Specify allowed statuses
  },

});

// Create the Order model based on the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

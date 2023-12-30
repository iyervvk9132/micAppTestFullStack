const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', 
    required: true
  },
  products: [
    {
      productName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothes', 
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
    enum: ['Available', 'In Use', 'Under Maintenance', 'Out of Service'] 
  },

});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

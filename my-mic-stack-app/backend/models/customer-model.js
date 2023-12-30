const mongoose = require('mongoose');


const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now 
  },
  orders:[{type:mongoose.Types.ObjectId,
  ref: 'order',
}],
});


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

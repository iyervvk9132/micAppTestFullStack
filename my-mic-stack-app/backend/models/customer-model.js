const mongoose = require('mongoose');

// Define the customer schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes extra spaces from the name
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email addresses are unique
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Sets the default value to the current date and time
  },
  orders:[mongoose.Types.ObjectId],
});

// Create the Customer model based on the schema
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

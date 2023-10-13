const mongoose = require('mongoose');

// Define the Employee schema
const employeeSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Sets the default value to the current date and time
  }
});

// Create the Employee model based on the schema
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

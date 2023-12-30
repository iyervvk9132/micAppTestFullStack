const mongoose = require('mongoose');


const employeeSchema = new mongoose.Schema({
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
    default: Date.now 
  }
});


const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

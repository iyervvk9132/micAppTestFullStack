const mongoose = require('mongoose');

// Define the workshop equipment schema
const officeEquipmentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes extra spaces from the name
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0 // Ensures quantity is non-negative
  },
  category: {
    type: String,
    required: true,
    enum: ['ironing', 'transport', 'office', 'maintenance', 'Other'] // Specifies the allowed categories
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Used', 'Refurbished'] // Specifies the allowed conditions
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'In Use', 'Under Maintenance', 'Out of Service'] // Specify allowed statuses
  },
  features: [{
    type: String,
    trim: true
  }],
  
  createdAt: {
    type: Date,
    default: Date.now // Sets the default value to the current date and time
  }
});

// Create the OfficeEquipments model based on the schema
const OfficeEquipments = mongoose.model('OfficeEquipments', officeEquipmentsSchema);

module.exports = OfficeEquipments;

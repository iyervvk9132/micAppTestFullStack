const mongoose = require('mongoose');


const officeEquipmentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true 
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0 
  },
  category: {
    type: String,
    required: true,
    enum: ['ironing', 'transport', 'office', 'maintenance', 'Other'] 
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Used', 'Refurbished'] 
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'In Use', 'Under Maintenance', 'Out of Service'] 
  },
  features: [{
    type: String,
    trim: true
  }],
  
  createdAt: {
    type: Date,
    default: Date.now 
  }
});


const OfficeEquipments = mongoose.model('OfficeEquipments', officeEquipmentsSchema);

module.exports = OfficeEquipments;

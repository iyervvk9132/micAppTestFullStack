const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const internalFlowSchema = new Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', 
        required: true
      },
    
  Price: {
    type: Number,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
    enum:['Male','Female','Kids','Others'],
  },
  Task: {
    type: String,
    required: true,
    enum: ['Dryclean', 'Ironing', 'Washing', 'Others'] 

  },
});

module.exports = mongoose.model('Clothes', clothesSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clothesSchema = new Schema({
  Clothtype: {
    type: String,
    required: true,
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
    enum: ['Dryclean', 'Ironing', 'Washing', 'Others'] // Specify allowed tasks

  },
  Id:{
    type: PublicKeyCredential,
    required: true,
  },
});

module.exports = mongoose.model('Clothes', clothesSchema);

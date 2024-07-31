const mongoose = require('mongoose');

const qrscanSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true,
  },
  start_station: {
    type: String,
    required: true,
  },
  end_station: {
    type: String,
    required: true,
  },
  number_of_station:{
    type:Number,
    required:true
  }

});

const qrscan = mongoose.model('qrscan', qrscanSchema);

module.exports = qrscan;

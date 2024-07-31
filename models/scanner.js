
const mongoose = require('mongoose');


const scannerSchema = new mongoose.Schema({
  _id: String,
  station:{
    type:String,
    required:true
  }
});


const User = mongoose.model('Scanner', scannerSchema);

module.exports = User;
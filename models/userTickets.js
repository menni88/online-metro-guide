const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserTicketSchema = new mongoose.Schema({
  _id:{
    type:String,
    required: true
  },
  user_id: {
    type:  Schema.Types.ObjectId,
    required: true,
    ref:"User"
  },
  stationNumber: {
    type:Number
  },
  status: {
    type: String,
    required: true,
  },
  startStation: {
    type: String
  }
});



const UserTickets = mongoose.model('UserTickets', UserTicketSchema);

module.exports = UserTickets;

const mongoose = require('mongoose');

const ticketsSchema = new mongoose.Schema({
category:String,
stationNumber:Number,
Public:Number,
Elderly:Number
});


const tickets = mongoose.model('Tickets', ticketsSchema);

module.exports = tickets;



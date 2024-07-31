const Tickets = require('../models/tickets');
const { formatStandardError } = require('../utils/responseModels');

exports.calcTicketData = async (req, age , numberOfStations)=>{
    let category;

   if(numberOfStations <= 9){
    category= "first"
   }else if(numberOfStations <= 16){
    category= "second"
   }else {
    category= "third"
   }
       

  const ticket = await Tickets.findOne({category: category});
  if(!ticket) throw formatStandardError(req,404, 'invalid_ticket_type',null);
  if(age<60){
    return {price:ticket.Public ,ticketStations:ticket.stationNumber };
  }else if(age < 70){
    return {price:ticket.Elderly ,ticketStations:ticket.stationNumber};
  }

           
}
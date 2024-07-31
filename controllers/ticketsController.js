const { getShortestPath,getAllStations } = require('../services/graghFunctions');
const { calculateDateOfBirthAndgovernment } = require("../utils/date_of_birth")
const { calcTicketData } = require("../utils/calcTicketPrice");
const { handleValidationErrors } = require("../utils/validateRequest");
const {TicketOrderDTO} =require("../services/paymentLogic/PaymentDTO");
const redisClient = require('../config/redis');
const { tokenGenerator } = require('../utils/qrTokenGenerator');
const { formatStandardError } = require('../utils/responseModels');
const {sendSuccess}=require("../utils/responseModels")
const Tickets = require('../models/tickets');
const userTickets = require('../models/userTickets');



exports.bookTicket = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const  startStation = req.body.startStation.trim();
    const  endStation = req.body.endStation.trim();
    const { numberOfStations, time } = await getShortestPath(req,startStation, endStation);
    const { age } = calculateDateOfBirthAndgovernment(req.user.nationalId);
    const {price ,ticketStations} = await calcTicketData(req,age, numberOfStations);

    sendSuccess(req,res,200,null,{
      ticket: {
        price,
        numberOfStations,
        ticketStations,
        time
      }
    })
    

  } catch (err) {
    next(err);
  }
};


exports.buyTicket = async (req, res, next) => {
  try {
    handleValidationErrors(req);
   
    const { price ,ticketStations} = req.body;
    const ticket = await Tickets.findOne({stationNumber:ticketStations ,$or: [{ Public: price }, { Elderly: price }] });
        if(!ticket) throw formatStandardError(req,404, 'invalid_ticket_type',null);
    const ticketOrder = new TicketOrderDTO(req.user._id, price,req.user.firebaseToken,ticketStations);
    Object.assign(req, ticketOrder);   
    next();


  } catch (err) {
   next(err);
  }
};


exports.getUserTickets = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const userId = req.user._id;
    const filterStatus= req.params.status;
    let filteredTickets;

    const ticketKeys = await redisClient.keys(`ticket:${userId}:*`);
    if(ticketKeys.length >0){
      const tickets = await Promise.all(
        ticketKeys.map(async (ticketKey) => {
          const ticket = await redisClient.hGetAll(ticketKey);
          
          if (ticket.status !== filterStatus) {
            return null;
         }
          
          let ticketInfo = {
            plainUUID: ticketKey.split(":")[2],
            status: ticket.status,
            stationNumber : parseInt(ticket.ticketStations),
            
        };
  
        if (filterStatus === "ongoing") {
            ticketInfo.startStation = ticket.startStation
        }
  
        return ticketInfo;
      }));
       filteredTickets = tickets.filter(ticket => ticket !== null); 
    }else{
       filteredTickets = await userTickets.find({user_id:userId,status:filterStatus});
    }



    return sendSuccess(req,res,200,null,{
      tickets: filteredTickets,
    })
  } catch (err) {
   next(err);
  }
};



exports.showQRCode = async (req, res, next) => {
  try {
    const ticketUUID= req.params.plainUUID;
    let ticketStatus;
    await redisClient.flushAll();

    ticketStatus = await redisClient.hGet(`ticket:${req.user._id}:${ticketUUID}`,"status");
    if(!ticketStatus) {
      const ticket = await userTickets.findById(ticketUUID);
      if(!ticket) throw formatStandardError(req,404,"ticket_not_found",null);
      ticketStatus = ticket.status;
    }
    if(ticketStatus === "used") throw formatStandardError(req,403,"used_ticket",null);

    const token = tokenGenerator(`${req.user._id}:${ticketUUID}`);

    sendSuccess(req,res,200,null,{ qrPayload: `ticket:${token}` })
   
  } catch (err) {
    next(err);
  }
};


exports.getTicketStations=async(req,res,next)=>{
  try{
    const stations=await getAllStations(req);
    sendSuccess(req,res,200,null,{stations:stations})
  }catch(err){
    next(err)
  }
}
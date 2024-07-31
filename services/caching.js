const redisClient = require("../config/redis");
const { v4: uuidv4 } = require('uuid');
const userTickets = require('../models/userTickets');
const { notificatoinFormat } = require("./notificationFormat");


module.exports.cacheSubscriptioion = async (req, res, next) => {
    try {
        if (!req.subscription) return;
        const payload = { "available_stations": JSON.stringify(req.subscription.available_stations) };

        await redisClient.hSet(`subscription:${req.params.sub_id}`, payload);

        await redisClient.set(`version:${req.params.sub_id}`, 0);



    } catch (err) {
        console.log(err);
        //retry mechanism
    }
};


exports.cacheNewTicket = async (req, res, next) => {
    const plainUUID = uuidv4();
    try {
        
        await redisClient.hSet(`ticket:${req.relatedData.user}:${plainUUID}`, {
            ticketStations: req.relatedData.ticketStations,
            status: "notused"
        });

        const ticket = new userTickets({
            _id: plainUUID,
            user_id: req.relatedData.user,
            stationNumber: req.relatedData.ticketStations, 
            status: "notused",
          });

        await ticket.save();


        if (req.paymentMethod === "payWithPaymob") {
            const data = {
                payload: {
                    type: "in_app",
                    msg: req.t('ticket_booked_success')
                }
            }
            req.notificatoinData = notificatoinFormat(data, req.firebaseToken);
            next();
        }

        //notify the client ?????

    } catch (error) {
        console.log(error);
        //retry mechanism
    }

};

exports.cacheTicketData = async (req, res, next) => {
    if(!req.cache){
       return next();
    }
    try {

        const ticketData = {
            ticketStations: req.ticketStations,
            status: req.status
          };
        
          if (req.startStation) {
            ticketData.startStation = req.startStation;
          }
        await redisClient.hSet(`ticket:${req.userId}:${req.ticketId}`, ticketData);
        next();
    } catch (error) {
        console.log(error);
        //retry mechanism
    }

};



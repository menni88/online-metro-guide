const userTickets = require('../../models/userTickets');
const redisClient = require("../../config/redis");
const {getSecondsUntilMidnight} =require("../../utils/Time");



module.exports.updateCacheTicket= async(req,res,next)=>{
    try{

        if (req.ticket.status ==='notused') {
            await redisClient.hSet(`ticket:${req.userId}:${ req.ticketId}`, "status", "ongoing");

            await redisClient.hSet(`ticket:${req.userId}:${ req.ticketId}`,"startStation",`${req.scannerId}`);

            await userTickets.findByIdAndUpdate(req.ticketId,{startStation:req.scannerId,status:"ongoing"});

        }else  if (req.ticket.status ==='ongoing'){
            await redisClient.hSet(`ticket:${req.userId}:${ req.ticketId}`, "status", "used");
            const ttlInSeconds = getSecondsUntilMidnight();
            await redisClient.expire(`ticket:${req.userId}:${ req.ticketId}`, ttlInSeconds);
            await userTickets.findByIdAndDelete(req.ticketId);
        }

    }catch (err) {
        console.log(err);
        //retry mechanism
    }
};  


const redisClient = require("../config/redis");
const { tokenDecoder } = require("../utils/qrTokenGenerator");
const { getTodayTimestamp } = require("../utils/Time");
const { formatStandardError } = require('../utils/responseModels');
const { getShortestPath } = require('../services/graghFunctions');
const { sendSuccess } = require("../utils/responseModels.js");
const { handleValidationErrors } = require("../utils/validateRequest");
const userTickets = require('../models/userTickets');



module.exports.validateTicket = async (req, res, next) => {
    try {
        handleValidationErrors(req);
        let ticket;
        let ticketId;
        let userId;
        const { id } = req.body;
        const decryptedId = tokenDecoder(id);
        [userId,ticketId] = decryptedId.split(":");
        ticket = await redisClient.hGetAll(`ticket:${decryptedId}`);

        if (!ticket || Object.keys(ticket).length  == 0) {

            ticket = await userTickets.findById(ticketId);
            if (!ticket) throw formatStandardError(req, 404, 'illegal_ticket');
            req.status=ticket.status;
            req.ticketStations=ticket.stationNumber;
            req.startStation=ticket.startStation;
            req.cache=true;
        }
        if (ticket.status === 'used') {
            throw formatStandardError(req, 409, 'used_ticket');

        } else if (ticket.status === 'ongoing') {
            if (ticket.startStation !== req.scannerId) {
                const { numberOfTripStations } = await getShortestPath(req, ticket.startStation, req.scannerId);
                if (numberOfTripStations > parseInt(ticket.ticketStations)) {
                    throw formatStandardError(req, 403, 'illegal_region');

                }


            }
        }


        req.userId=userId;
        req.ticketId=ticketId;
        req.ticket = ticket;
        sendSuccess(req, res, 200, "Ticket_validated_successfully", null);
        next();

    } catch (err) {
        next(err);
    }

};



module.exports.validateSubscription = async (req, res, next) => {
    try {
        handleValidationErrors(req);

        const { id } = req.body;
        const [version, timestamp, subscriptionId] = tokenDecoder(id).split(":");
        const todayTimestamp = getTodayTimestamp();

        if (timestamp !== todayTimestamp) throw formatStandardError(req, 401, 'expired_qrcode', null);


        const versionInCache = await redisClient.get(`version:${subscriptionId}`);

        if (!versionInCache || versionInCache !== version) {
            throw formatStandardError(req, 403, 'illegal_subscription', null);
        } else {
            const availableStations = JSON.parse(await redisClient.hGet(`subscription:${subscriptionId}`, "available_stations"));
            if (!availableStations.includes(req.scannerId)) throw formatStandardError(req, 403, 'not_pass', null);

            sendSuccess(req, res, 200, "subscription_validated_successfully", null)
            await redisClient.incr(`version:${subscriptionId}`);
        }


    } catch (err) {
        next(err);
    }
};

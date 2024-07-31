const { notificatoinFormat } = require("../services/notificationFormat");
const { validateAcceptHMAC } = require("../services/paymentLogic/paymobUtilities");
const { formatStandardError } = require("../utils/responseModels");
const {sendSuccess}=require("../utils/responseModels")


module.exports.paymobCallback = (req, res, next) => {
    try {
        const callbackData = req.body;
        const receivedHMAC = req.query.hmac;
        if (!validateAcceptHMAC(callbackData, receivedHMAC)) throw formatStandardError(req,401, 'HMAC validation failed',null);
        const { success, amount_cents,order} = callbackData.obj;
        const { shipping_data } = order;
        const {relatedData,paymentType,paymentMethod} = JSON.parse(shipping_data.state);

        if (!success) {
            const data = {
                payload: {
                    type: "mixed",
                    error: req.t('payment_failed')
                }
            }
            req.notificatoinData = notificatoinFormat(data, req.firebaseToken);
            req.fail = true;
            next();
        }

        //notify the client
        req.relatedData={};
        req.relatedData.user = relatedData.user;
        req.paymentType = paymentType;
        req.paymentMethod = paymentMethod;
        req.firebaseToken = relatedData.firebaseToken

        if (paymentType === 'ticket') {
            req.relatedData.ticketStations= relatedData.ticketStations;
            req.relatedData.category= relatedData.category;

        } else if (paymentType === 'subscription') {
            req.relatedData.subscriptionId = relatedData.subscriptionId;
            req.relatedData.duration = relatedData.duration;
        } else {
            req.amount = amount_cents / 100;
        }
        sendSuccess(req,res,200,"payment success",null);
        next();

    } catch (err) {
        next(err);
    }

};



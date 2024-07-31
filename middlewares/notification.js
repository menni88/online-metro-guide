const fireBaseApp = require('../config/firebase').fireBaseApp;
const admin = require('firebase-admin');
module.exports.sendNotification = async function (req, res, next) {

    if(!req.notificationData){
       return next();
    }
   
    try {
        response = await admin.messaging(fireBaseApp).send(req.notificatoinData.message);
        req.notificatoinData.sent = true;
    } catch (error) {
        req.notificatoinData.error = error.message;
    }

    //logic to store notifications in database if needed

    return;
};

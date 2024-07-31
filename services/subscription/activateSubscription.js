const User = require("../../models/user");
const user_subscription = require('../../models/user_subscription');
const { combuteSubscriptionExpiration } = require("../../utils/Time");
const { notificatoinFormat } = require("../notificationFormat");


exports.activateSubscription = async (req, res, next) => {
    try {
        let now = new Date();
        let expireDate = combuteSubscriptionExpiration(req,now, req.relatedData.duration);
        await user_subscription.findByIdAndUpdate(
            { _id: req.relatedData.subscriptionId },
            { status: "active", start_date: now, expire_date: expireDate },
            );
            
        if(req.paymentMethod ==="payWithPaymob"){
            const data = {
                payload: {
                    type: "in_app",
                    msg: req.t('subscription_activation_succcess'),
                }
            }
            req.notificatoinData = notificatoinFormat(data, req.firebaseToken);
            next();
        }
       
        // notify the client??????

    } catch (err) {
        console.log(err);
        //retry mechanism
    }
};
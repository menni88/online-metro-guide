const User = require("../../models/user");
const { notificatoinFormat } = require("../notificationFormat");


exports.charge = async (req, res, next) => {
   try {
      const updatedUser = await User.findOneAndUpdate(
         { _id: req.relatedData.user },
         { $inc: { balance: req.amount } },
         { new: true }
      );
      const data = {
         payload: {
            type:"in_app",
            msg: req.t('charge_succcess'),
            balance: updatedUser.balance
         }
      }
      req.notificatoinData = notificatoinFormat(data, updatedUser.firebaseToken);
      next();
      //notify the client???    
   } catch (err) {
      next(err);
   }
};
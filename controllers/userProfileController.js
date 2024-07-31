const {ChargeOrderDTO} = require("../services/paymentLogic/PaymentDTO");
const user = require("../models/user");
const { handleValidationErrors } = require("../utils/validateRequest");
const { formatStandardError } = require("../utils/responseModels");
const {sendSuccess}=require("../utils/responseModels")

exports.charge = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { chargeAmount } = req.body;


    const chargeOrder = new ChargeOrderDTO(req.user._id, chargeAmount,req.user.firebaseToken);
    Object.assign(req, chargeOrder);

    next();


  } catch (err) {
    next(err);
  }
};



exports.getBalance = async (req, res, next) => {
  try {
    const User = await user.findOne({ _id: req.user._id });
    if (!User)  throw formatStandardError(req,404, 'user_not_found',null)
       
    const { balance } = User;
    sendSuccess(req,res,200,null,{ balance })

  } catch (err) {
    next(err);
  }



}



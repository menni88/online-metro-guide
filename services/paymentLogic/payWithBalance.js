const {sendSuccess}=require("../../utils/responseModels")
exports.payWithBalance = async (req, res, next) => {
  try {
    req.user.balance -= req.orderAmount;
    await req.user.save();
    sendSuccess(req,res,200,'payment_success',{balance : req.user.balance, paymentType: req.paymentType})
    next();

  } catch (err) {
    next(err);
  }
};
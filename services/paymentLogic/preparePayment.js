const { authenticate, createPaymentKey } = require("./paymobUtilities");
const {sendSuccess}=require("../../utils/responseModels")
module.exports.preparePayment = async (req, res, next) => {
  try {
    const authToken = await authenticate(req);
    const paymentKey = await createPaymentKey(req,authToken, req.orderAmount ,req.relatedData ,req.paymentType);

    sendSuccess(req,res,200,null,{ paymentKey })

  } catch (err) {
     next(err);
  }
}




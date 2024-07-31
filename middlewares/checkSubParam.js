const { formatBadRequest } = require("../utils/responseModels");

module.exports.checkSubscriptionId=(req, res, next)=>{
    const sub_id = req.params.sub_id;
    try {
        if (!sub_id) throw formatBadRequest(req, [{
          msg:"Subscription_id_required",
          path:"sub_id",
          location:"param"
        }]);
        
        next();
      } catch (err) {
        next(err);
      }
  }
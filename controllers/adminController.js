const Admin=require("../models/admin")
const {handleValidationErrors}=require("../utils/validateRequest");
const bcrypt = require('bcrypt');
const { formatStandardError } = require('../utils/responseModels');
const {sendSuccess}=require("../utils/responseModels")
const {getPhotoPath}=require("../services/subscription/adminFiles")
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const user_subscription = require("../models/user_subscription")

exports.adminLogin=async (req,res,next)=>{

try{
    
    handleValidationErrors(req);
    const now = moment().tz('Africa/Cairo');
    const hour = now.hour();

    if (hour >= 1 && hour < 5) {
        throw formatStandardError(req,405, 'Logins_are_not_allowed_between_1_AM_and_5_AM',null);
      }
      const { Id, password } = req.body;
      const admin = await Admin.findOne({ Id });
      
    if (!admin) throw formatStandardError(req,404, 'user_not_found',null);
    if(!bcrypt.compareSync(password,admin.password))  throw formatStandardError(req,401, 'wrong_password',null);

    const Token=admin.genAccessToken();

    sendSuccess(req,res,200,"logged_in_successfully",{ 
        accessToken: Token, 
      })


}

catch (err) {
    next(err);

}

}

exports.getSubscriptions=async(req,res,next)=>{
    try{
        const admin_id = req.admin._id;
        const subscriptions = await user_subscription.find({ admin_Id: admin_id ,status: "pending"  }).select('_id');
        if (!subscriptions||subscriptions.length==0) throw formatStandardError(req, 404, 'no_Subscriptions',null);
        sendSuccess(req,res,200,null,{ 
            subscriptionIds:subscriptions, 
          })

    }catch(err){
        next(err);
    }
}

exports.getSubPhoto=async(req,res,next)=>{
    try{

        const {sub_id}  = req.params;
        const subscription = await user_subscription.findById({_id: sub_id }).select('user_id');
        if (!subscription) {
            throw formatStandardError(req,404, 'subscription_not_found',null);
          }
          const {user_id}=subscription;
          const photoPath = getPhotoPath(user_id, sub_id);
          if (photoPath) {
            sendSuccess(req, res, 200, null, { photoPath:photoPath });
        } else {
            throw formatStandardError(req, 404, 'photo_not_found', null);
        }
    }catch(err){
        next(err)
    }
}

exports.acceptSubscription = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { sub_id } = req.params;
    const subscription = await user_subscription.findById({ _id: sub_id }).populate('user_id').exec();
    if (!subscription) throw formatStandardError(req, 404, 'subscription_not_found', null);
    subscription.status = "notactive";
    subscription.admin_Id = undefined;
    await subscription.save();
    sendSuccess(req, res, 200, 'Subscription_accepted_successfully', null);
    req.userId = subscription.user_id._id;
    req.subId = sub_id;
    req.firebaseToken=subscription.user_id.firebaseToken;
    req.msg='subscription_accepted'
    next(); 
  } catch (err) {
    next(err);
  }
};

exports.denySubscription = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { sub_id } = req.params;
    const subscription = await user_subscription.findByIdAndDelete({ _id: sub_id }).populate('user_id').exec();
    if (!subscription) throw formatStandardError(req, 404, 'subscription_not_found', null);
    sendSuccess(req, res, 200, 'Subscription_denied_successfully', null);
    req.userId = subscription.user_id._id;
    req.subId = sub_id;
    req.firebaseToken=subscription.user_id.firebaseToken;
    req.msg='subscription_denied'
    next(); 
  } catch (err) {
    next(err);
  }
};